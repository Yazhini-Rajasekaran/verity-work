export type Industry = 'construction' | 'hospital_sanitation';

export type WageType = 'hourly' | 'daily';

export type DailyWagePolicy =
  | 'standard_8h_ot_pro_rata' // Standard 8h base. OT > 8h paid pro-rata at (dailyRate / 8) * OT_mult
  | 'fixed_daily_wage'         // Fixed flat daily rate regardless of OT
  | 'half_full_day_tier';      // < 5h = 0.5x daily rate; >= 5h = 1.0x daily rate

export type RecordSource =
  | 'manual_worker_entry'
  | 'ai_extracted_worker_confirmed'
  | 'supervisor_verified';

export type DiscrepancyStatus =
  | 'none'
  | 'pending_review'
  | 'under_review'
  | 'resolved'
  | 'needs_info';

export type DifferenceType = 'shortfall' | 'excess' | 'match' | 'unknown';

export interface ShiftCalculation {
  elapsedDurationHours: number;
  unpaidBreakHours: number;
  netWorkedHours: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  expectedPay: number;
  paymentReceived: number | null;
  paymentDifference: number | null; // expectedPay - paymentReceived
  differenceType: DifferenceType;
  assumptions: string[];
  isValid: boolean;
  validationError?: string;
}

export interface DiscrepancyCase {
  id: string;
  status: DiscrepancyStatus;
  workerExplanation: string;
  createdAt: string;
  updatedAt: string;
  aiExplanation?: string;
  supervisorNotes?: string;
  reviewedBy?: string;
  resolutionSummary?: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  role: 'worker' | 'supervisor';
  industry?: Industry;
  organizationId: string;
}

export interface ShiftRecord {
  id: string;
  workerId: string;
  workerName: string;
  organizationId?: string;
  industry: Industry;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isOvernight: boolean;
  breakMinutes: number;
  wageType: WageType;
  agreedRate: number;
  overtimeThresholdHours: number;
  overtimeMultiplier: number;
  dailyWagePolicy: DailyWagePolicy;
  paymentReceived: number | null; // null if unknown
  notes?: string;
  recordSource: RecordSource;
  calculation: ShiftCalculation;
  discrepancyCase?: DiscrepancyCase;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedShiftData {
  industry?: Industry;
  date?: string;
  startTime?: string;
  endTime?: string;
  isOvernight?: boolean;
  breakMinutes?: number;
  wageType?: WageType;
  agreedRate?: number;
  paymentReceived?: number | null;
  notes?: string;
  rawInput: string;
  missingOrAmbiguousFields: string[];
  extractionNotes?: string;
}
