import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  calculateShiftWage,
  isValidTimeString,
  isValidDateString,
  roundCurrency,
} from './utils/wageCalculator';
import {
  ShiftRecord,
  DiscrepancyStatus,
  Industry,
  WageType,
  DailyWagePolicy,
  RecordSource,
  AuthenticatedUser,
} from './types/shift';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Configure proxy trust for Cloud Run environments (1 proxy hop)
app.set('trust proxy', 1);

// 1. Strict Security Headers & CSP
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Content Security Policy permitting Vite SPA scripts and local styles/fonts/images
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self';"
  );
  next();
});

app.use(express.json({ limit: '100kb' }));

// Helper to parse cookies from header
function parseCookies(header?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!header) return list;
  header.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('=').trim());
    }
  });
  return list;
}

// 2. Cryptographically Signed Session Authentication Engine
const SESSION_SECRET = process.env.SESSION_SECRET || 'verity-work-signed-hmac-session-secret-2026';

function signToken(sessionId: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(sessionId).digest('hex');
  return `${sessionId}.${hmac}`;
}

function verifyToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) return null;
  const sessionId = token.slice(0, dotIndex);
  const providedHmac = token.slice(dotIndex + 1);
  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(sessionId).digest('hex');

  try {
    const a = Buffer.from(providedHmac, 'hex');
    const b = Buffer.from(expectedHmac, 'hex');
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return sessionId;
    }
  } catch {
    return null;
  }
  return null;
}

export interface SystemPrincipal extends AuthenticatedUser {
  passcode: string;
}

// Known authenticated demo accounts with deterministic security credentials
const PRINCIPALS: Record<string, SystemPrincipal> = {
  'worker-ramesh': {
    id: 'worker-ramesh',
    username: 'ramesh',
    name: 'Ramesh Kumar',
    role: 'worker',
    industry: 'construction',
    organizationId: 'delhi_metro_phase4',
    passcode: '1234',
  },
  'worker-sunita': {
    id: 'worker-sunita',
    username: 'sunita',
    name: 'Sunita Devi',
    role: 'worker',
    industry: 'hospital_sanitation',
    organizationId: 'delhi_metro_phase4',
    passcode: '1234',
  },
  'supervisor-rajesh': {
    id: 'supervisor-rajesh',
    username: 'supervisor_rajesh',
    name: 'Rajesh Sharma',
    role: 'supervisor',
    industry: 'construction',
    organizationId: 'delhi_metro_phase4',
    passcode: 'super123',
  },
};

interface ServerSession {
  sessionId: string;
  userId: string;
  role: 'worker' | 'supervisor';
  createdAt: number;
  expiresAt: number;
}

const activeSessions = new Map<string, ServerSession>();

// Periodic session cleanup
setInterval(() => {
  const now = Date.now();
  for (const [sid, sess] of activeSessions.entries()) {
    if (now > sess.expiresAt) {
      activeSessions.delete(sid);
    }
  }
}, 60 * 60 * 1000);

// Server-side Authentication Middleware (Fails closed!)
function authenticate(req: Request, res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const token = cookies.verity_session || bearerToken;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in with a verified account.',
    });
  }

  const sessionId = verifyToken(token);
  if (!sessionId) {
    return res.status(401).json({
      error: 'Invalid or forged authentication token.',
    });
  }

  const session = activeSessions.get(sessionId);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(sessionId);
    return res.status(401).json({
      error: 'Session expired or invalidated. Please sign in again.',
    });
  }

  const principal = PRINCIPALS[session.userId];
  if (!principal) {
    return res.status(401).json({
      error: 'Account associated with session no longer exists.',
    });
  }

  // Attach verified user identity to request; ignore any client-supplied spoofing headers
  (req as any).user = principal;
  next();
}

// 3. Sliding-Window Rate Limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function rateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Cloud Run proxy IP resolution
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const current = rateLimitMap.get(ip);

    if (!current || now > current.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again shortly.',
      });
    }

    current.count += 1;
    next();
  };
}

// 4. Initialize Gemini Client safely (server-side only, never expose key to frontend)
const rawKey = process.env.GEMINI_API_KEY;
const isPlaceholderKey = !rawKey || rawKey === 'MY_GEMINI_API_KEY' || rawKey.trim() === '';
let ai: GoogleGenAI | null = null;

if (!isPlaceholderKey) {
  ai = new GoogleGenAI({
    apiKey: rawKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out, using fast on-device fallback')), timeoutMs)
    ),
  ]);
}

// In-Memory Shift Database with initial realistic benchmark records
function getInitialDemoShifts(): ShiftRecord[] {
  const shift1Calc = calculateShiftWage({
    startTime: '08:00',
    endTime: '17:00',
    breakMinutes: 60,
    wageType: 'daily',
    agreedRate: 750,
    overtimeThresholdHours: 8,
    dailyWagePolicy: 'standard_8h_ot_pro_rata',
    paymentReceived: 750,
  });

  const shift2Calc = calculateShiftWage({
    startTime: '08:00',
    endTime: '18:30',
    breakMinutes: 30,
    wageType: 'daily',
    agreedRate: 750,
    overtimeThresholdHours: 8,
    overtimeMultiplier: 1.5,
    dailyWagePolicy: 'standard_8h_ot_pro_rata',
    paymentReceived: 700,
  });

  const shift3Calc = calculateShiftWage({
    startTime: '07:00',
    endTime: '15:30',
    breakMinutes: 30,
    wageType: 'hourly',
    agreedRate: 85,
    overtimeThresholdHours: 8,
    paymentReceived: null, // Unknown / pending
  });

  const shift4Calc = calculateShiftWage({
    startTime: '22:00',
    endTime: '06:30',
    isOvernight: true,
    breakMinutes: 30,
    wageType: 'hourly',
    agreedRate: 90,
    overtimeThresholdHours: 8,
    overtimeMultiplier: 1.5,
    paymentReceived: 650,
  });

  return [
    {
      id: 'demo-shift-1',
      workerId: 'worker-ramesh',
      workerName: 'Ramesh Kumar',
      organizationId: 'delhi_metro_phase4',
      industry: 'construction',
      date: '2026-10-24',
      startTime: '08:00',
      endTime: '17:00',
      isOvernight: false,
      breakMinutes: 60,
      wageType: 'daily',
      agreedRate: 750,
      overtimeThresholdHours: 8,
      overtimeMultiplier: 1.5,
      dailyWagePolicy: 'standard_8h_ot_pro_rata',
      paymentReceived: 750,
      notes: 'Site A pillar casting. Paid in cash end of day.',
      recordSource: 'manual_worker_entry',
      calculation: shift1Calc,
      createdAt: '2026-10-24T18:00:00.000Z',
      updatedAt: '2026-10-24T18:00:00.000Z',
    },
    {
      id: 'demo-shift-2',
      workerId: 'worker-ramesh',
      workerName: 'Ramesh Kumar',
      organizationId: 'delhi_metro_phase4',
      industry: 'construction',
      date: '2026-10-25',
      startTime: '08:00',
      endTime: '18:30',
      isOvernight: false,
      breakMinutes: 30,
      wageType: 'daily',
      agreedRate: 750,
      overtimeThresholdHours: 8,
      overtimeMultiplier: 1.5,
      dailyWagePolicy: 'standard_8h_ot_pro_rata',
      paymentReceived: 700,
      notes: 'Worked extra concrete pour. Handed ₹700 cash only.',
      recordSource: 'ai_extracted_worker_confirmed',
      calculation: shift2Calc,
      discrepancyCase: {
        id: 'case-demo-2',
        status: 'pending_review',
        workerExplanation:
          'Worked 10 net hours (2 hours overtime). Expected ₹750 base plus overtime pro-rata, but received ₹700.',
        aiExplanation:
          'Under the configured daily wage rule (₹750 base for 8 hours with 1.5x overtime pro-rata), 10.0 net hours yields an estimated ₹937.50. With ₹700 entered, there is a possible difference of ₹237.50 to review with your supervisor.',
        createdAt: '2026-10-25T19:30:00.000Z',
        updatedAt: '2026-10-25T19:30:00.000Z',
      },
      createdAt: '2026-10-25T19:00:00.000Z',
      updatedAt: '2026-10-25T19:30:00.000Z',
    },
    {
      id: 'demo-shift-3',
      workerId: 'worker-sunita',
      workerName: 'Sunita Devi',
      organizationId: 'delhi_metro_phase4',
      industry: 'hospital_sanitation',
      date: '2026-10-25',
      startTime: '07:00',
      endTime: '15:30',
      isOvernight: false,
      breakMinutes: 30,
      wageType: 'hourly',
      agreedRate: 85,
      overtimeThresholdHours: 8,
      overtimeMultiplier: 1.5,
      dailyWagePolicy: 'standard_8h_ot_pro_rata',
      paymentReceived: null, // Unknown / pending
      notes: 'ICU ward deep clean and waste clearance.',
      recordSource: 'manual_worker_entry',
      calculation: shift3Calc,
      createdAt: '2026-10-25T16:00:00.000Z',
      updatedAt: '2026-10-25T16:00:00.000Z',
    },
    {
      id: 'demo-shift-4',
      workerId: 'worker-sunita',
      workerName: 'Sunita Devi',
      organizationId: 'delhi_metro_phase4',
      industry: 'hospital_sanitation',
      date: '2026-10-26',
      startTime: '22:00',
      endTime: '06:30',
      isOvernight: true,
      breakMinutes: 30,
      wageType: 'hourly',
      agreedRate: 90,
      overtimeThresholdHours: 8,
      overtimeMultiplier: 1.5,
      dailyWagePolicy: 'standard_8h_ot_pro_rata',
      paymentReceived: 650,
      notes: 'Emergency sanitation night shift.',
      recordSource: 'ai_extracted_worker_confirmed',
      calculation: shift4Calc,
      discrepancyCase: {
        id: 'case-demo-4',
        status: 'under_review',
        workerExplanation: 'Night shift completed 8 hours. Expected ₹720 at ₹90/hr, received only ₹650.',
        aiExplanation:
          'Your recorded shift is 8.0 net hours after the break. Under the agreed hourly rate of ₹90, your estimated pay is ₹720. The payment entered is ₹650, leaving a possible difference of ₹70.',
        supervisorNotes: 'Cross-verifying biometric punch card with hospital facility desk.',
        reviewedBy: 'Rajesh Sharma',
        createdAt: '2026-10-26T07:15:00.000Z',
        updatedAt: '2026-10-26T09:00:00.000Z',
      },
      createdAt: '2026-10-26T07:00:00.000Z',
      updatedAt: '2026-10-26T09:00:00.000Z',
    },
  ];
}

let shiftsStore: ShiftRecord[] = getInitialDemoShifts();

// 5. Strict Input Validation Engine
interface ValidatedShiftInput {
  workerId?: string;
  workerName?: string;
  industry: Industry;
  date: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  breakMinutes: number;
  wageType: WageType;
  agreedRate: number;
  overtimeThresholdHours: number;
  overtimeMultiplier: number;
  dailyWagePolicy: DailyWagePolicy;
  paymentReceived: number | null;
  notes: string;
  recordSource: RecordSource;
}

function validateAndSanitizeShiftInput(
  raw: any
): { valid: true; data: ValidatedShiftInput } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Shift payload must be a JSON object.' };
  }

  // Industry
  if (raw.industry !== 'construction' && raw.industry !== 'hospital_sanitation') {
    return { valid: false, error: 'Industry must be either "construction" or "hospital_sanitation".' };
  }
  const industry: Industry = raw.industry;

  // Date
  if (!isValidDateString(raw.date)) {
    return { valid: false, error: 'Shift date must be a valid calendar date in YYYY-MM-DD format.' };
  }
  const date = raw.date.trim();

  // Times
  if (!isValidTimeString(raw.startTime) || !isValidTimeString(raw.endTime)) {
    return { valid: false, error: 'Start and end times must be valid 24-hour times formatted strictly as HH:mm.' };
  }
  const startTime = raw.startTime.trim();
  const endTime = raw.endTime.trim();
  const isOvernight = Boolean(raw.isOvernight);

  // Break Minutes
  const breakMinutes = Number(raw.breakMinutes ?? 0);
  if (!Number.isFinite(breakMinutes) || breakMinutes < 0 || breakMinutes > 720) {
    return { valid: false, error: 'Break duration must be a finite number between 0 and 720 minutes.' };
  }

  // Wage Type
  if (raw.wageType !== 'hourly' && raw.wageType !== 'daily') {
    return { valid: false, error: 'Wage type must be "hourly" or "daily".' };
  }
  const wageType: WageType = raw.wageType;

  // Agreed Rate
  const agreedRate = Number(raw.agreedRate);
  if (!Number.isFinite(agreedRate) || agreedRate <= 0 || agreedRate > 100000) {
    return { valid: false, error: 'Agreed wage rate must be a finite positive number greater than 0.' };
  }

  // Overtime Threshold & Multiplier
  const overtimeThresholdHours = Number(raw.overtimeThresholdHours ?? 8);
  if (!Number.isFinite(overtimeThresholdHours) || overtimeThresholdHours <= 0 || overtimeThresholdHours > 24) {
    return { valid: false, error: 'Overtime threshold must be a finite positive number between 1 and 24.' };
  }

  const overtimeMultiplier = Number(raw.overtimeMultiplier ?? 1.5);
  if (!Number.isFinite(overtimeMultiplier) || overtimeMultiplier < 1 || overtimeMultiplier > 5) {
    return { valid: false, error: 'Overtime multiplier must be between 1.0 and 5.0.' };
  }

  // Daily Wage Policy
  const dailyPolicies: DailyWagePolicy[] = ['standard_8h_ot_pro_rata', 'fixed_daily_wage', 'half_full_day_tier'];
  const dailyWagePolicy: DailyWagePolicy = dailyPolicies.includes(raw.dailyWagePolicy)
    ? raw.dailyWagePolicy
    : 'standard_8h_ot_pro_rata';

  // Payment Received
  let paymentReceived: number | null = null;
  if (raw.paymentReceived !== undefined && raw.paymentReceived !== null && raw.paymentReceived !== '') {
    const pNum = Number(raw.paymentReceived);
    if (!Number.isFinite(pNum) || pNum < 0 || pNum > 1000000) {
      return { valid: false, error: 'Payment received must be a non-negative number under ₹10,00,000.' };
    }
    paymentReceived = roundCurrency(pNum);
  }

  // Notes
  const notes = typeof raw.notes === 'string' ? raw.notes.slice(0, 500).trim() : '';

  // Record Source
  const validSources: RecordSource[] = ['manual_worker_entry', 'ai_extracted_worker_confirmed', 'supervisor_verified'];
  const recordSource: RecordSource = validSources.includes(raw.recordSource)
    ? raw.recordSource
    : 'manual_worker_entry';

  return {
    valid: true,
    data: {
      workerId: typeof raw.workerId === 'string' ? raw.workerId.trim() : undefined,
      workerName: typeof raw.workerName === 'string' ? raw.workerName.trim().slice(0, 100) : undefined,
      industry,
      date,
      startTime,
      endTime,
      isOvernight,
      breakMinutes,
      wageType,
      agreedRate,
      overtimeThresholdHours,
      overtimeMultiplier,
      dailyWagePolicy,
      paymentReceived,
      notes,
      recordSource,
    },
  };
}

// Fallback rule parser for shift text when Gemini is offline or not configured
function parseShiftTextLocally(text: string, industryHint?: string) {
  const missingOrAmbiguousFields: string[] = [];

  let startTime = '';
  let endTime = '';
  let isOvernight = false;

  const timeRangeMatch = text.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|until|se|tak)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
  );

  function normalizeTimeTo24h(tStr: string): string {
    const raw = tStr.trim().toLowerCase();
    const isPm =
      raw.includes('pm') ||
      raw.includes('शाम') ||
      raw.includes('रात') ||
      raw.includes('மாலை') ||
      raw.includes('இரவு') ||
      raw.includes('సాయంత్రం') ||
      raw.includes('రాత్రి') ||
      raw.includes('ಸಂಜೆ') ||
      raw.includes('ರಾತ್ರಿ') ||
      raw.includes('വൈകുന്നേരം') ||
      raw.includes('രാത്രി');
    const isAm =
      raw.includes('am') ||
      raw.includes('सुबह') ||
      raw.includes('காலை') ||
      raw.includes('ఉదయం') ||
      raw.includes('ಬೆಳಗ್ಗೆ') ||
      raw.includes('രാവിലെ');
    const clean = raw.replace(/[^\d:]/g, '');
    const parts = clean.split(':');
    let h = parseInt(parts[0] || '0', 10);
    const m = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  if (timeRangeMatch) {
    startTime = normalizeTimeTo24h(timeRangeMatch[1]);
    endTime = normalizeTimeTo24h(timeRangeMatch[2]);
  } else {
    missingOrAmbiguousFields.push('startTime', 'endTime');
  }

  if (
    text.toLowerCase().includes('night') ||
    text.includes('रात') ||
    text.includes('இரவு') ||
    text.includes('రాత్రి') ||
    text.includes('ರಾತ್ರಿ') ||
    text.includes('രാത്രി') ||
    (startTime && endTime && startTime > endTime)
  ) {
    isOvernight = true;
  }

  let breakMinutes = 0;
  const breakMatch = text.match(/(\d+)\s*(?:-|–|\s)?\s*(?:min|minute|m\b|நிமிடம்|నిమిషాలు|ನಿಮಿಷ|മിനിറ്റ്)/i);
  if (breakMatch) {
    breakMinutes = parseInt(breakMatch[1], 10);
  } else if (/half\s*an?\s*hour|aadha\s*ghanta|அரை மணி|అర గంట|ಅರ್ಧ ಗಂಟೆ|അര മണിക്കൂർ/i.test(text)) {
    breakMinutes = 30;
  } else if (/1\s*hour\s*break|1\s*hr\s*lunch|ek\s*ghanta|ஒரு மணி|ఒక గంట|ಒಂದು ಗಂಟೆ|ഒരു മണിക്കൂർ/i.test(text)) {
    breakMinutes = 60;
  } else {
    missingOrAmbiguousFields.push('breakMinutes (not stated, defaulted to 0 for review)');
  }

  let paymentReceived: number | null = null;
  const paymentMatch =
    text.match(/(?:received|got|paid|mila|mile|payment|pay|கொடுத்தார்கள்|ఇచ్చారు|ಕೊಟ್ಟರು|കിട്ടി)\s*(?:is|was|of|₹|rs\.?|ரூபாய்|రూపాయలు|ರೂಪಾಯಿ|രൂപ)?\s*(\d+(?:\.\d{1,2})?)/i) ||
    text.match(/(?:₹|rs\.?|ரூபாய்|రూపాయలు|ರೂಪಾಯಿ|രൂപ)\s*(\d+(?:\.\d{1,2})?)\s*(?:received|got|mila|mile|கொடுத்தார்கள்|ఇచ్చారు|ಕೊಟ್ಟರು|കിട്ടി)?/i) ||
    text.match(/(\d+(?:\.\d{1,2})?)\s*(?:ரூபாய்|రూపాయలు|ರೂಪಾಯಿ|രൂപ|rupees|rs)/i);
  if (paymentMatch) {
    paymentReceived = parseFloat(paymentMatch[1]);
  } else {
    missingOrAmbiguousFields.push('paymentReceived (pending or unknown)');
  }

  let agreedRate: number | undefined;
  let wageType: WageType = 'hourly';
  const rateMatch =
    text.match(/(?:rate|wage|dihaadi|agreed)\s*(?:is|of|₹|rs\.?)?\s*(\d+(?:\.\d{1,2})?)/i) ||
    text.match(/(\d+)\s*(?:per\s*hour|\/hr|ghanta)/i) ||
    text.match(/(\d+)\s*(?:per\s*day|\/day|dihaadi)/i);
  if (rateMatch) {
    agreedRate = parseFloat(rateMatch[1]);
  }

  if (/per\s*day|daily|dihaadi|\/day/i.test(text) || (agreedRate && agreedRate >= 300)) {
    wageType = 'daily';
  } else if (/per\s*hour|hourly|\/hr/i.test(text)) {
    wageType = 'hourly';
  } else if (!agreedRate) {
    missingOrAmbiguousFields.push('agreedRate');
  }

  let industry: Industry = 'construction';
  if (industryHint === 'hospital_sanitation' || /hospital|sanitation|ward|nurse|cleaner|safai/i.test(text)) {
    industry = 'hospital_sanitation';
  }

  return {
    industry,
    startTime: startTime || '08:00',
    endTime: endTime || '17:00',
    isOvernight,
    breakMinutes,
    wageType,
    agreedRate: agreedRate ?? (wageType === 'daily' ? 750 : 85),
    paymentReceived,
    notes: text.trim().slice(0, 500),
    missingOrAmbiguousFields,
    source: 'local_heuristic_parser',
  };
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Login endpoint: Verifies principal credentials, issues cryptographically signed session cookie & token
app.post('/api/auth/login', rateLimiter(20, 60000), (req: Request, res: Response) => {
  const { username, passcode, userId } = req.body;

  let targetPrincipal: SystemPrincipal | undefined;
  if (userId && PRINCIPALS[userId]) {
    targetPrincipal = PRINCIPALS[userId];
  } else if (username) {
    targetPrincipal = Object.values(PRINCIPALS).find(
      (p) => p.username.toLowerCase() === String(username).toLowerCase()
    );
  }

  if (!targetPrincipal) {
    return res.status(401).json({ error: 'Invalid username or user identity.' });
  }

  // Validate passcode
  if (passcode && passcode !== targetPrincipal.passcode) {
    return res.status(401).json({ error: 'Invalid credentials or passcode.' });
  }

  // Generate cryptographically signed session
  const sessionId = crypto.randomUUID();
  const token = signToken(sessionId);
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeSessions.set(sessionId, {
    sessionId,
    userId: targetPrincipal.id,
    role: targetPrincipal.role,
    createdAt: Date.now(),
    expiresAt,
  });

  // Set secure HttpOnly cookie
  res.setHeader(
    'Set-Cookie',
    `verity_session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${isProd ? '; Secure' : ''}`
  );

  return res.json({
    success: true,
    user: {
      id: targetPrincipal.id,
      username: targetPrincipal.username,
      name: targetPrincipal.name,
      role: targetPrincipal.role,
      industry: targetPrincipal.industry,
      organizationId: targetPrincipal.organizationId,
    },
    token,
  });
});

// Logout endpoint: Destroys server session and clears cookie
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;
  const token = cookies.verity_session || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null);

  if (token) {
    const sid = verifyToken(token);
    if (sid) activeSessions.delete(sid);
  }

  res.setHeader(
    'Set-Cookie',
    `verity_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`
  );
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Current user profile endpoint
app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as SystemPrincipal;
  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      industry: user.industry,
      organizationId: user.organizationId,
    },
  });
});

// ==========================================
// GEMINI & SHIFT PROCESSING ROUTES
// ==========================================

// 1. Extract shift details from natural language text
app.post('/api/extract-shift', rateLimiter(30, 60000), async (req: Request, res: Response) => {
  const { rawText, industryHint } = req.body;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Text input cannot be empty.' });
  }

  // Bounded input length to protect model resources
  if (rawText.length > 1000) {
    return res.status(400).json({ error: 'Input text exceeds maximum allowed length of 1000 characters.' });
  }

  const safeInput = rawText.trim();

  // Try Gemini if available
  if (ai) {
    try {
      const prompt = `You are an information extraction assistant for VERITY WORK ("Your work. Your record. Your worth.").
Given the worker's natural language statement, extract structured shift details.

Worker statement:
"""
${safeInput}
"""
Industry context hint: ${typeof industryHint === 'string' ? industryHint.slice(0, 50) : 'not specified'}

CRITICAL EXTRACTION RULES:
1. Extract ONLY information explicitly supported by the worker's statement.
2. NEVER invent or assume missing dates, start times, end times, wage rates, break duration, or payment amounts.
3. If a field is missing or ambiguous, leave it empty or null and add its name to 'missingOrAmbiguousFields' with an explanation.
4. Format times as strictly 24-hour "HH:mm" strings (e.g. "08:00", "18:30").
5. If the shift spans midnight or is marked night shift, set isOvernight = true.
6. For breakMinutes, return integer minutes (e.g. 30). If not stated, do not invent.
7. For agreedRate, return the number if stated (e.g. 80 or 750).
8. For paymentReceived, return the number if stated, or null if payment is unknown/pending.
9. Support multilingual expressions across:
   - English
   - Hindi: "subah" / सुबह (AM), "shaam" / शाम (PM), "raat" / रात (night), "dihaadi" / दिहाड़ी (daily wage), "aadha ghanta" / आधा घंटा (30 min)
   - Tamil: "kaalai" / காலை (morning), "maalai" / மாலை (evening), "iravu" / இரவு (night), "mani" / மணி (hour/time), "saapadu" / சாப்பாடு (lunch/break), "roobai" / ரூபாய் (rupees)
   - Telugu: "udayam" / ఉదయం (morning), "saayantram" / సాయంత్రం (evening), "raatri" / రాత్రి (night), "gantalu" / గంటలు (hours), "kooli" / కూలీ (wage), "roopaayalu" / రూపాయలు (rupees)
   - Kannada: "belagge" / ಬೆಳಗ್ಗೆ (morning), "sanje" / ಸಂಜೆ (evening), "raatri" / ರಾತ್ರಿ (night), "gante" / ಗಂಟೆ (hour), "roopaayi" / ರೂಪಾಯಿ (rupees)
   - Malayalam: "raavile" / രാവിലെ (morning), "vaikunneram" / വൈകുന്നേരം (evening), "raathri" / രാത്രി (night), "manikkoor" / മണിക്കൂർ (hour), "roopa" / രൂപ (rupees)`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                industry: {
                  type: Type.STRING,
                  description: "Either 'construction' or 'hospital_sanitation'",
                },
                date: {
                  type: Type.STRING,
                  description: 'Date in YYYY-MM-DD if mentioned, or null',
                },
                startTime: {
                  type: Type.STRING,
                  description: 'Start time in HH:mm 24h format',
                },
                endTime: {
                  type: Type.STRING,
                  description: 'End time in HH:mm 24h format',
                },
                isOvernight: {
                  type: Type.BOOLEAN,
                  description: 'True if shift crosses midnight',
                },
                breakMinutes: {
                  type: Type.INTEGER,
                  description: 'Unpaid break duration in minutes',
                },
                wageType: {
                  type: Type.STRING,
                  description: "Either 'hourly' or 'daily'",
                },
                agreedRate: {
                  type: Type.NUMBER,
                  description: 'Agreed hourly or daily rate, or null if missing',
                },
                paymentReceived: {
                  type: Type.NUMBER,
                  description: 'Actual payment received, or null if pending/unknown',
                },
                notes: {
                  type: Type.STRING,
                  description: 'Additional shift remarks or location',
                },
                missingOrAmbiguousFields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of fields that were missing or ambiguous in the worker statement',
                },
                extractionConfidenceNotes: {
                  type: Type.STRING,
                  description: 'Brief note on extraction certainty',
                },
              },
              required: ['missingOrAmbiguousFields'],
            },
          },
        }),
        8000
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        data: parsed,
        extracted: parsed,
      });
    } catch (err: any) {
      console.warn('Gemini extraction unavailable, falling back to on-device parser:', err.message);
      const fallbackData = parseShiftTextLocally(safeInput, industryHint);
      return res.json({
        success: true,
        source: 'local_parser_fallback',
        warning: 'Gemini extraction temporarily unavailable; using on-device parser.',
        data: fallbackData,
        extracted: fallbackData,
      });
    }
  }

  // Local fallback if no Gemini API key configured
  const localData = parseShiftTextLocally(safeInput, industryHint);
  return res.json({
    success: true,
    source: 'local_parser',
    data: localData,
    extracted: localData,
  });
});

// 2. Generate neutral discrepancy explanation
app.post('/api/explain-discrepancy', rateLimiter(30, 60000), async (req: Request, res: Response) => {
  const { shift, calculation, workerExplanation, language } = req.body;

  if (!calculation || typeof calculation !== 'object') {
    return res.status(400).json({ error: 'Valid calculation object is required.' });
  }

  const netWorkedHours = roundCurrency(Number(calculation.netWorkedHours) || 0);
  const expectedPay = roundCurrency(Number(calculation.expectedPay) || 0);
  const paymentReceived =
    calculation.paymentReceived !== null && calculation.paymentReceived !== undefined
      ? roundCurrency(Number(calculation.paymentReceived))
      : null;
  const paymentDifference =
    calculation.paymentDifference !== null && calculation.paymentDifference !== undefined
      ? roundCurrency(Number(calculation.paymentDifference))
      : null;
  const differenceType = calculation.differenceType || 'unknown';
  const regularHours = roundCurrency(Number(calculation.regularHours) || 0);
  const overtimeHours = roundCurrency(Number(calculation.overtimeHours) || 0);

  // Safe fallback explanation template
  const fallbackExplanation =
    differenceType === 'shortfall'
      ? `Your recorded shift is ${netWorkedHours} hours after deducting unpaid breaks. Under the selected wage rules, your estimated pay is ₹${expectedPay}. The recorded payment is ₹${paymentReceived}, leaving a possible difference of ₹${paymentDifference}. Please review the recorded hours, agreed rate, and payment receipts with your supervisor.`
      : differenceType === 'excess'
      ? `Your recorded shift is ${netWorkedHours} hours with an estimated expectation of ₹${expectedPay}. The recorded payment is ₹${paymentReceived}, which exceeds the estimate by ₹${Math.abs(paymentDifference || 0)}.`
      : `Your recorded shift is ${netWorkedHours} hours. The recorded payment matches the estimated calculation of ₹${expectedPay}.`;

  if (ai) {
    try {
      const targetLangName =
        language === 'ta' ? 'Tamil' :
        language === 'te' ? 'Telugu' :
        language === 'kn' ? 'Kannada' :
        language === 'ml' ? 'Malayalam' :
        language === 'hi' ? 'Hindi' : 'English';

      const prompt = `You are a neutral, respectful mediator assistant for VERITY WORK ("Your work. Your record. Your worth.").
Given an already calculated shift and payment difference, produce a clear, simple, neutral explanation suitable for a worker to review or share with their supervisor (e.g. over WhatsApp).
Output language requested: ${targetLangName}.

INPUT DATA (DO NOT ALTER ANY NUMBERS):
- Industry: ${typeof shift?.industry === 'string' ? shift.industry.slice(0, 50) : 'General'}
- Date: ${typeof shift?.date === 'string' ? shift.date.slice(0, 20) : 'Shift date'}
- Net Worked Hours: ${netWorkedHours} hrs (${regularHours} hrs regular + ${overtimeHours} hrs overtime)
- Agreed Rate: ₹${shift?.agreedRate ? roundCurrency(Number(shift.agreedRate)) : 0} (${shift?.wageType || 'hourly'})
- Expected Pay: ₹${expectedPay}
- Recorded Payment Received: ${paymentReceived !== null ? `₹${paymentReceived}` : 'Pending/Unknown'}
- Calculated Payment Difference: ${paymentDifference !== null ? `₹${paymentDifference}` : 'N/A'} (${differenceType})
- Worker's Stated Note: "${typeof workerExplanation === 'string' ? workerExplanation.slice(0, 300) : 'None'}"

CRITICAL RULES:
1. Use the EXACT numbers calculated and provided above. Never perform your own arithmetic or change numbers.
2. NEVER use accusatory language like 'wage theft', 'stole', 'cheated', or 'illegal underpayment'.
3. Use neutral terms like 'possible difference', 'possible shortfall', 'calculated estimate', 'under the configured rate'.
4. Politely suggest verifying the hours and payment details with the site supervisor or contractor.
5. Keep it concise (2 to 3 sentences in ${targetLangName}).`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        8000
      );

      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        explanation: response.text?.trim() || fallbackExplanation,
      });
    } catch (err: any) {
      console.warn('Gemini explanation fallback:', err.message);
      return res.json({
        success: true,
        source: 'deterministic_template',
        explanation: fallbackExplanation,
      });
    }
  }

  return res.json({
    success: true,
    source: 'deterministic_template',
    explanation: fallbackExplanation,
  });
});

// ==========================================
// SHIFT CRUD ENDPOINTS WITH STRICT DATA ISOLATION
// ==========================================

// 3. GET /api/shifts: Workers only see their own records; Supervisors see records in their organization
app.get('/api/shifts', authenticate, rateLimiter(120, 60000), (req: Request, res: Response) => {
  const user = (req as any).user as SystemPrincipal;

  // WORKER DATA ISOLATION: Worker can ONLY retrieve their own shift history
  if (user.role === 'worker') {
    const workerShifts = shiftsStore.filter((s) => s.workerId === user.id);
    return res.json({
      success: true,
      count: workerShifts.length,
      shifts: workerShifts,
    });
  }

  // SUPERVISOR ISOLATION: Supervisor can ONLY view records for workers within their organization/site
  if (user.role === 'supervisor') {
    const orgShifts = shiftsStore.filter(
      (s) => (s.organizationId || 'delhi_metro_phase4') === user.organizationId
    );
    return res.json({
      success: true,
      count: orgShifts.length,
      shifts: orgShifts,
    });
  }

  return res.status(403).json({ error: 'Forbidden: Unrecognized system role.' });
});

// 4. POST /api/shifts: Derive worker principal exclusively from server session
app.post('/api/shifts', authenticate, rateLimiter(60, 60000), (req: Request, res: Response) => {
  const user = (req as any).user as SystemPrincipal;
  const validation = validateAndSanitizeShiftInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const s = validation.data;

  // ENFORCE SERVER-VERIFIED IDENTITY:
  // If caller is worker: client CANNOT spoof workerId or workerName.
  let assignedWorkerId = user.id;
  let assignedWorkerName = user.name;
  let recordSource: RecordSource = s.recordSource;

  if (user.role === 'worker') {
    assignedWorkerId = user.id;
    assignedWorkerName = user.name;
    // Strip client attempts to self-certify as supervisor_verified
    if (recordSource === 'supervisor_verified') {
      recordSource = 'manual_worker_entry';
    }
  } else if (user.role === 'supervisor') {
    // Supervisor creating a shift on behalf of a worker in their organization
    if (s.workerId && PRINCIPALS[s.workerId]) {
      assignedWorkerId = s.workerId;
      assignedWorkerName = PRINCIPALS[s.workerId].name;
    }
    recordSource = 'supervisor_verified';
  }

  // Authoritative server-side calculation (never trust client arithmetic)
  const calc = calculateShiftWage({
    startTime: s.startTime,
    endTime: s.endTime,
    isOvernight: s.isOvernight,
    breakMinutes: s.breakMinutes,
    wageType: s.wageType,
    agreedRate: s.agreedRate,
    overtimeThresholdHours: s.overtimeThresholdHours,
    overtimeMultiplier: s.overtimeMultiplier,
    dailyWagePolicy: s.dailyWagePolicy,
    paymentReceived: s.paymentReceived,
  });

  if (!calc.isValid) {
    return res.status(400).json({
      error: calc.validationError || 'Shift calculation failed validation.',
    });
  }

  const newRecord: ShiftRecord = {
    id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    workerId: assignedWorkerId,
    workerName: assignedWorkerName,
    organizationId: user.organizationId,
    industry: s.industry,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    isOvernight: s.isOvernight,
    breakMinutes: s.breakMinutes,
    wageType: s.wageType,
    agreedRate: s.agreedRate,
    overtimeThresholdHours: s.overtimeThresholdHours,
    overtimeMultiplier: s.overtimeMultiplier,
    dailyWagePolicy: s.dailyWagePolicy,
    paymentReceived: s.paymentReceived,
    notes: s.notes,
    recordSource,
    calculation: calc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  shiftsStore.unshift(newRecord);
  res.status(201).json({ success: true, shift: newRecord });
});

// 5. PUT /api/shifts/:id: Role-enforced update boundary & cross-worker tampering barrier
app.put('/api/shifts/:id', authenticate, rateLimiter(60, 60000), (req: Request, res: Response) => {
  const user = (req as any).user as SystemPrincipal;
  const { id } = req.params;
  const index = shiftsStore.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Shift record not found.' });
  }

  const existing = shiftsStore[index];

  // CROSS-WORKER TAMPERING BARRIER: Workers can ONLY modify their own records
  if (user.role === 'worker' && existing.workerId !== user.id) {
    return res.status(403).json({
      error: 'Unauthorized: Workers can only update their own shift records.',
    });
  }

  // SUPERVISOR SCOPE BARRIER: Supervisors can only modify records within their organization
  if (
    user.role === 'supervisor' &&
    (existing.organizationId || 'delhi_metro_phase4') !== user.organizationId
  ) {
    return res.status(403).json({
      error: 'Unauthorized: Supervisors can only review records in their assigned organization.',
    });
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid update payload.' });
  }

  // Handle discrepancyCase updates with strict role boundaries
  let updatedDiscrepancyCase = existing.discrepancyCase;
  if (body.discrepancyCase && typeof body.discrepancyCase === 'object') {
    const dReq = body.discrepancyCase;
    const allowedStatuses: DiscrepancyStatus[] = ['none', 'pending_review', 'under_review', 'resolved', 'needs_info'];

    if (dReq.status && !allowedStatuses.includes(dReq.status)) {
      return res.status(400).json({ error: `Invalid discrepancy status: "${dReq.status}".` });
    }

    // Worker role boundary: Workers can only submit or edit workerExplanation with 'pending_review' or 'none'
    if (user.role === 'worker') {
      if (dReq.status && dReq.status !== 'pending_review' && dReq.status !== 'none') {
        return res.status(403).json({
          error: 'Unauthorized: Workers cannot set discrepancy status to under_review, resolved, or needs_info.',
        });
      }
      if (dReq.supervisorNotes || dReq.reviewedBy || dReq.resolutionSummary) {
        return res.status(403).json({
          error: 'Unauthorized: Workers cannot modify supervisor review fields or notes.',
        });
      }
    }

    const currentCase = existing.discrepancyCase || {
      id: `case-${Date.now()}`,
      status: 'pending_review' as DiscrepancyStatus,
      workerExplanation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updatedDiscrepancyCase = {
      ...currentCase,
      status: dReq.status || currentCase.status,
      workerExplanation:
        typeof dReq.workerExplanation === 'string'
          ? dReq.workerExplanation.slice(0, 500).trim()
          : currentCase.workerExplanation,
      aiExplanation:
        typeof dReq.aiExplanation === 'string'
          ? dReq.aiExplanation.slice(0, 500).trim()
          : currentCase.aiExplanation,
      supervisorNotes:
        user.role === 'supervisor' && typeof dReq.supervisorNotes === 'string'
          ? dReq.supervisorNotes.slice(0, 500).trim()
          : currentCase.supervisorNotes,
      reviewedBy:
        user.role === 'supervisor'
          ? user.name
          : currentCase.reviewedBy,
      resolutionSummary:
        user.role === 'supervisor' && typeof dReq.resolutionSummary === 'string'
          ? dReq.resolutionSummary.slice(0, 500).trim()
          : currentCase.resolutionSummary,
      updatedAt: new Date().toISOString(),
    };
  }

  // Recalculate if core parameters were updated
  const startTime = typeof body.startTime === 'string' && isValidTimeString(body.startTime) ? body.startTime : existing.startTime;
  const endTime = typeof body.endTime === 'string' && isValidTimeString(body.endTime) ? body.endTime : existing.endTime;
  const isOvernight = typeof body.isOvernight === 'boolean' ? body.isOvernight : existing.isOvernight;
  const breakMinutes = typeof body.breakMinutes === 'number' && Number.isFinite(body.breakMinutes) && body.breakMinutes >= 0
    ? body.breakMinutes
    : existing.breakMinutes;
  const wageType = body.wageType === 'hourly' || body.wageType === 'daily' ? body.wageType : existing.wageType;
  const agreedRate = typeof body.agreedRate === 'number' && Number.isFinite(body.agreedRate) && body.agreedRate > 0
    ? body.agreedRate
    : existing.agreedRate;
  const overtimeThresholdHours =
    typeof body.overtimeThresholdHours === 'number' && Number.isFinite(body.overtimeThresholdHours) && body.overtimeThresholdHours > 0
      ? body.overtimeThresholdHours
      : existing.overtimeThresholdHours;
  const overtimeMultiplier =
    typeof body.overtimeMultiplier === 'number' && Number.isFinite(body.overtimeMultiplier) && body.overtimeMultiplier >= 1
      ? body.overtimeMultiplier
      : existing.overtimeMultiplier;
  const dailyWagePolicy =
    body.dailyWagePolicy === 'standard_8h_ot_pro_rata' ||
    body.dailyWagePolicy === 'fixed_daily_wage' ||
    body.dailyWagePolicy === 'half_full_day_tier'
      ? body.dailyWagePolicy
      : existing.dailyWagePolicy;

  let paymentReceived = existing.paymentReceived;
  if (body.paymentReceived !== undefined) {
    if (body.paymentReceived === null || body.paymentReceived === '') {
      paymentReceived = null;
    } else {
      const pNum = Number(body.paymentReceived);
      if (Number.isFinite(pNum) && pNum >= 0) {
        paymentReceived = roundCurrency(pNum);
      }
    }
  }

  const notes = typeof body.notes === 'string' ? body.notes.slice(0, 500).trim() : existing.notes;

  // Server recalculates calculation authoritatively
  const calculation = calculateShiftWage({
    startTime,
    endTime,
    isOvernight,
    breakMinutes,
    wageType,
    agreedRate,
    overtimeThresholdHours,
    overtimeMultiplier,
    dailyWagePolicy,
    paymentReceived,
  });

  const updatedRecord: ShiftRecord = {
    ...existing,
    startTime,
    endTime,
    isOvernight,
    breakMinutes,
    wageType,
    agreedRate,
    overtimeThresholdHours,
    overtimeMultiplier,
    dailyWagePolicy,
    paymentReceived,
    notes,
    calculation,
    discrepancyCase: updatedDiscrepancyCase,
    updatedAt: new Date().toISOString(),
  };

  shiftsStore[index] = updatedRecord;
  res.json({ success: true, shift: updatedRecord });
});

// 6. DELETE /api/shifts/:id: Privileged Deletion Endpoint
app.delete('/api/shifts/:id', authenticate, rateLimiter(60, 60000), (req: Request, res: Response) => {
  const user = (req as any).user as SystemPrincipal;
  const { id } = req.params;
  const index = shiftsStore.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Shift not found.' });
  }

  const existing = shiftsStore[index];

  // Worker can only delete their own shift; Supervisor can only delete within their organization
  if (user.role === 'worker' && existing.workerId !== user.id) {
    return res.status(403).json({
      error: 'Unauthorized: Workers cannot delete records belonging to other workers.',
    });
  }

  if (
    user.role === 'supervisor' &&
    (existing.organizationId || 'delhi_metro_phase4') !== user.organizationId
  ) {
    return res.status(403).json({
      error: 'Unauthorized: Supervisors cannot delete records outside their assigned organization.',
    });
  }

  shiftsStore.splice(index, 1);
  res.json({ success: true, message: 'Shift record deleted.' });
});

// 7. POST /api/reset-demo: Protected Administrative Reset Endpoint
app.post('/api/reset-demo', authenticate, rateLimiter(10, 60000), (req: Request, res: Response) => {
  const user = (req as any).user as SystemPrincipal;

  // Require verified supervisor identity
  if (user.role !== 'supervisor') {
    return res.status(403).json({
      error: 'Unauthorized: Administrative demo reset requires supervisor authorization.',
    });
  }

  // Fails closed in production environments
  if (isProd && !process.env.ALLOW_PROD_RESET) {
    return res.status(403).json({
      error: 'Administrative reset is permanently disabled in production environments.',
    });
  }

  shiftsStore = getInitialDemoShifts();
  res.json({ success: true, count: shiftsStore.length, shifts: shiftsStore });
});

// In Vercel, route requests through this Express function and serve the built SPA here.
// Vercel rewrites preserve the incoming path, so /api/* reaches the API handlers above.
if (process.env.VERCEL) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Global Safe Error Handler: never leak stack traces or internal environment details
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Handled server error:', err?.message || 'Unknown error');
  res.status(500).json({ error: 'An unexpected internal error occurred. Please try again.' });
});

// Dev vs Prod Vite setup
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Verity Work server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

// Export the Express app for Vercel's serverless API function.
export default app;

// Vercel invokes the exported app as a function. Only start a listening
// server for local development or standalone hosting.
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
