# VERITY WORK

> **Your work. Your record. Your worth.**

VERITY WORK is a worker-first, accessible, multilingual application designed for daily-wage construction laborers and contract hospital sanitation staff. It converts simple voice or text shift statements into structured personal work records, calculates expected wages using transparent deterministic rules, identifies possible discrepancies against recorded payments, and provides a respectful workflow for workers and supervisors to audit and resolve disputes.

---

## 1. Sustainable Development Goals (SDG) Alignment

- **SDG 8.5**: Decent work and equal pay for work of equal value.
- **SDG 8.8**: Protection of labour rights and promotion of safe, transparent working environments.

VERITY WORK ensures that daily-wage workers who often receive lump-sum cash without paper pay slips possess an auditable personal work history, understand their expected pay, and have clear visibility into overtime and agreed wage rules.

---

## 2. Accessibility & Low-Literacy Usability

- **Warm Deep Teal & Off-White Palette**: High-contrast, dignified color system with zero AI slop. Teal for confirmed records, amber for pending reviews, red only for genuine validation errors.
- **4 Prominent Worker Action Cards**:
  1. **Record My Shift**: Voice or text input with 5-step guided wizard or classic fast form.
  2. **Check My Pay**: Instant deterministic wage calculation with expandable "How was this calculated?" arithmetic breakdown.
  3. **My Work History**: Personal work log with status badges and filters.
  4. **Track My Complaints**: Clear visibility into supervisor review and resolution notes.
- **5-Step Guided Shift Logger**: Designed for low-literacy workers, guiding step-by-step from location/date to time, agreed rate, payment received, and review. Includes toggle for classic fast form for experienced workers.
- **Voice-First Input**: Web Speech API with BCP-47 language matching for hands-free dictation.

---

## 3. Multilingual Support (6 Languages)

VERITY WORK supports native-script switching across 6 regional and national languages:
1. **English** (`en-IN`)
2. **தமிழ் — Tamil** (`ta-IN`)
3. **తెలుగు — Telugu** (`te-IN`)
4. **ಕನ್ನಡ — Kannada** (`kn-IN`)
5. **മലയാളം — Malayalam** (`ml-IN`)
6. **हिन्दी — Hindi** (`hi-IN`)

Both frontend UI components and backend heuristic parsers / Gemini prompts support multilingual phrases for work shifts, breaks, rates, and payments.

---

## 4. Core Architecture & Security Model

VERITY WORK is built as a full-stack React + Express application ready for containerized deployment on Google Cloud Run.

### A. Deterministic Wage Arithmetic (Zero AI Arithmetic)
- Wage calculations are strictly deterministic code in `src/utils/wageCalculator.ts`.
- Generative AI (Gemini) is **never** used for arithmetic, time calculations, or rate policies.
- Full floating-point precision is maintained during intermediate calculations; currency rounding is applied only to final monetary outputs (subtotals and totals), guaranteeing exact mathematical consistency.

### B. Security & Anti-Tampering Engine
- **Server-Authoritative Calculations**: Wage expectations and discrepancies are recalculated on the server (`server.ts`). Client-submitted totals or calculations are never trusted.
- **Mass-Assignment Protection**: Update endpoints only accept strictly whitelisted fields. Protected fields (`id`, `workerId`, `calculation`, audit dates, verified tags) cannot be overwritten by client payloads.
- **Role & Privilege Enforcement**:
  - The UI role switch is a demonstrative prototype convenience.
  - The API layer enforces role headers (`x-fairshift-role`, `x-worker-id`).
  - Workers cannot modify another worker's shift records or transition cases to supervisor-only statuses (`under_review`, `resolved`, `needs_info`).
  - Administrative demo database reset (`POST /api/reset-demo`) and record deletions are restricted to supervisors.
- **Security Headers & Limits**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - Body payload limit: `100kb`
  - In-memory sliding-window rate limiting on AI and shift endpoints.
  - Safe error handling: Internal exceptions and stack traces are never exposed in production HTTP responses.

### C. Gemini 3.8 Flash Integration
- Handled exclusively server-side with `@google/genai`.
- API keys are read solely from server environment variables (`process.env.GEMINI_API_KEY`) and are never sent to the browser or bundled in client scripts.
- Natural-language input is treated as untrusted data with strict length bounds (1000 characters) and schema validation.
- All Gemini calls use a resilient 8-second timeout with an immediate on-device heuristic fallback to guarantee continuous offline/local functionality.

---

## 5. Built-in Core Verification & Test Suite

The application includes an automated regression test suite (`src/utils/testSuite.ts`) with 22 rigorous tests:
1. Break duration subtraction.
2. Regular and overtime hour calculations.
3. Hourly wage calculation.
4. Daily wage overtime pro-rata policy.
5. Overnight midnight crossing shifts.
6. Rejection of invalid times (`08:00junk`, `25:00`, `8:5`).
7. Calendar date validity (`YYYY-MM-DD`, rejects non-existent dates).
8. Rejection of excessive breaks.
9. Missing wage rate guards.
10. Zero payment handling (distinguished from unknown payment).
11. Full-precision currency rounding (₹750 day, 8.5h net = ₹820.31).
12. Strict `HH:mm` format validation.
13. Non-finite (`NaN`, `Infinity`) guards.
14. Unknown payment safety (never treated as ₹0).
15. Identical start/end time zero-duration rejection.
16. Overtime parameter configuration guards.
17. Negative break duration rejection.
18. Half-day and full-day tier daily policies.
19. Industry configuration independence (Construction vs Hospital).
20. Server-side role authorization & anti-mass-assignment barrier.
21. Multilingual 6-language dictionary integrity & BCP-47 speech locale verification.
22. Non-accusatory neutral discrepancy phrasing audit.

---

## 6. Running Locally & Deployment

### Local Development
```bash
npm install
npm run dev
```
The server runs on `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

### Google Cloud Run Deployment
Deploy using standard Google Cloud Buildpacks or Dockerfile with environment variable:
- `GEMINI_API_KEY`: User secret provided at runtime.
- `PORT`: Set to `3000` (or injected by Cloud Run).
