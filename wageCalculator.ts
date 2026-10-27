import { DailyWagePolicy, ShiftCalculation, WageType } from '../types/shift';

export interface CalculationInput {
  startTime: string; // Strictly HH:mm
  endTime: string;   // Strictly HH:mm
  isOvernight?: boolean;
  breakMinutes: number;
  wageType: WageType;
  agreedRate: number;
  overtimeThresholdHours?: number;
  overtimeMultiplier?: number;
  dailyWagePolicy?: DailyWagePolicy;
  paymentReceived?: number | null;
}

/**
 * Strict 24-hour time format: HH:mm (00:00 to 23:59)
 */
export const STRICT_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates strictly whether an input string is valid HH:mm
 */
export function isValidTimeString(timeStr: unknown): timeStr is string {
  if (typeof timeStr !== 'string') return false;
  return STRICT_TIME_REGEX.test(timeStr.trim());
}

/**
 * Validates calendar date string: YYYY-MM-DD
 */
export function isValidDateString(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  return (
    dateObj.getUTCFullYear() === y &&
    dateObj.getUTCMonth() === m - 1 &&
    dateObj.getUTCDate() === d
  );
}

/**
 * Parses strict "HH:mm" into decimal hours from midnight (e.g. "08:30" => 8.5)
 */
export function timeStringToHours(timeStr: string): number {
  if (!isValidTimeString(timeStr)) return NaN;
  const match = timeStr.trim().match(STRICT_TIME_REGEX);
  if (!match) return NaN;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h + m / 60;
}

/**
 * Rounds a currency amount to 2 decimal places using standard accounting rounding
 */
export function roundCurrency(num: number): number {
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

const ALLOWED_WAGE_TYPES: WageType[] = ['hourly', 'daily'];
const ALLOWED_DAILY_POLICIES: DailyWagePolicy[] = [
  'standard_8h_ot_pro_rata',
  'fixed_daily_wage',
  'half_full_day_tier',
];

/**
 * Pure, deterministic calculation of working hours and expected pay.
 * Gemini or external models must never perform this arithmetic.
 * Full floating-point precision is maintained during intermediate steps,
 * and currency rounding is applied consistently to final monetary outputs.
 */
export function calculateShiftWage(input: CalculationInput): ShiftCalculation {
  const assumptions: string[] = [];
  const overtimeThreshold = input.overtimeThresholdHours ?? 8;
  const overtimeMultiplier = input.overtimeMultiplier ?? 1.5;
  const dailyPolicy = input.dailyWagePolicy ?? 'standard_8h_ot_pro_rata';

  // Helper for invalid responses
  const makeInvalidResponse = (errorMsg: string, haltedAssumption: string): ShiftCalculation => ({
    elapsedDurationHours: 0,
    unpaidBreakHours: 0,
    netWorkedHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    regularPay: 0,
    overtimePay: 0,
    expectedPay: 0,
    paymentReceived:
      input.paymentReceived !== undefined &&
      input.paymentReceived !== null &&
      Number.isFinite(Number(input.paymentReceived)) &&
      Number(input.paymentReceived) >= 0
        ? Number(input.paymentReceived)
        : null,
    paymentDifference: null,
    differenceType: 'unknown',
    assumptions: [`Calculation halted: ${haltedAssumption}`],
    isValid: false,
    validationError: errorMsg,
  });

  // 1. Validate wage rate
  if (
    input.agreedRate === undefined ||
    input.agreedRate === null ||
    typeof input.agreedRate !== 'number' ||
    !Number.isFinite(input.agreedRate) ||
    input.agreedRate <= 0
  ) {
    return makeInvalidResponse(
      'Agreed wage rate must be specified, finite, and strictly greater than zero.',
      'Agreed wage rate must be greater than 0.'
    );
  }

  // 2. Validate wage type and daily policy enums
  if (!ALLOWED_WAGE_TYPES.includes(input.wageType)) {
    return makeInvalidResponse(
      `Invalid wage type: "${input.wageType}". Allowed values are 'hourly' or 'daily'.`,
      'Unsupported wage type.'
    );
  }

  if (input.wageType === 'daily' && !ALLOWED_DAILY_POLICIES.includes(dailyPolicy)) {
    return makeInvalidResponse(
      `Invalid daily wage policy: "${dailyPolicy}".`,
      'Unsupported daily wage policy.'
    );
  }

  // 3. Validate overtime rules
  if (
    typeof overtimeThreshold !== 'number' ||
    !Number.isFinite(overtimeThreshold) ||
    overtimeThreshold <= 0
  ) {
    return makeInvalidResponse(
      'Overtime threshold must be a finite number greater than zero.',
      'Invalid overtime threshold.'
    );
  }

  if (
    typeof overtimeMultiplier !== 'number' ||
    !Number.isFinite(overtimeMultiplier) ||
    overtimeMultiplier < 1
  ) {
    return makeInvalidResponse(
      'Overtime multiplier must be a finite number of at least 1.0.',
      'Invalid overtime multiplier.'
    );
  }

  // 4. Validate payment received format if provided
  if (input.paymentReceived !== undefined && input.paymentReceived !== null) {
    const pNum = Number(input.paymentReceived);
    if (!Number.isFinite(pNum) || pNum < 0) {
      return makeInvalidResponse(
        'Actual payment received cannot be negative or non-finite.',
        'Invalid payment received amount.'
      );
    }
  }

  // 5. Validate break duration
  if (
    input.breakMinutes === undefined ||
    input.breakMinutes === null ||
    typeof input.breakMinutes !== 'number' ||
    !Number.isFinite(input.breakMinutes) ||
    input.breakMinutes < 0
  ) {
    return makeInvalidResponse(
      'Break duration must be a finite, non-negative number of minutes.',
      'Break duration cannot be negative.'
    );
  }

  // 6. Validate strict time formats
  if (!isValidTimeString(input.startTime) || !isValidTimeString(input.endTime)) {
    return makeInvalidResponse(
      'Invalid shift start or end time format. Please provide valid strictly padded HH:mm values (00:00 to 23:59).',
      'Invalid start or end time format (must be strict HH:mm).'
    );
  }

  const startH = timeStringToHours(input.startTime);
  const endH = timeStringToHours(input.endTime);

  // 7. Calculate elapsed duration
  let elapsed = 0;
  const isCrossingMidnight = endH < startH;

  if (isCrossingMidnight) {
    elapsed = 24 - startH + endH;
    assumptions.push('Overnight shift detected: crossed midnight boundary.');
  } else if (endH === startH) {
    return makeInvalidResponse(
      'Shift start time and end time cannot be identical (zero duration).',
      'Start and end time cannot be identical.'
    );
  } else {
    // endH > startH
    elapsed = endH - startH;
    if (input.isOvernight) {
      assumptions.push('Standard daytime shift duration used (end time is later than start time).');
    }
  }

  // 8. Subtract break duration
  const unpaidBreakHours = input.breakMinutes / 60;

  if (unpaidBreakHours >= elapsed) {
    return makeInvalidResponse(
      `Unpaid break (${input.breakMinutes} mins) cannot equal or exceed total shift duration (${roundCurrency(elapsed)} hrs).`,
      'Unpaid break duration equals or exceeds total shift duration.'
    );
  }

  const netWorkedHoursExact = elapsed - unpaidBreakHours;
  const netWorkedHours = roundCurrency(netWorkedHoursExact);

  assumptions.push(
    `Net worked hours = ${roundCurrency(elapsed)}h elapsed - ${roundCurrency(unpaidBreakHours)}h unpaid break = ${netWorkedHours}h.`
  );

  // 9. Regular vs Overtime hours
  let regularHours = 0;
  let overtimeHours = 0;

  if (netWorkedHoursExact <= overtimeThreshold) {
    regularHours = roundCurrency(netWorkedHoursExact);
    overtimeHours = 0;
  } else {
    regularHours = roundCurrency(overtimeThreshold);
    overtimeHours = roundCurrency(netWorkedHoursExact - overtimeThreshold);
    assumptions.push(
      `Overtime threshold of ${overtimeThreshold}h exceeded: ${regularHours}h regular + ${overtimeHours}h overtime.`
    );
  }

  // 10. Calculate expected pay with full intermediate precision
  let regularPay = 0;
  let overtimePay = 0;
  let expectedPay = 0;

  if (input.wageType === 'hourly') {
    const rawRegularPay = regularHours * input.agreedRate;
    const overtimeHourlyRate = input.agreedRate * overtimeMultiplier;
    const rawOvertimePay = overtimeHours * overtimeHourlyRate;

    regularPay = roundCurrency(rawRegularPay);
    overtimePay = roundCurrency(rawOvertimePay);
    expectedPay = roundCurrency(rawRegularPay + rawOvertimePay);

    assumptions.push(
      `Hourly rate: ₹${input.agreedRate}/hr. Overtime rate: ₹${roundCurrency(overtimeHourlyRate)}/hr (${overtimeMultiplier}x).`
    );
  } else {
    // Daily wage policies
    if (dailyPolicy === 'fixed_daily_wage') {
      regularPay = roundCurrency(input.agreedRate);
      overtimePay = 0;
      expectedPay = regularPay;
      assumptions.push(`Fixed daily wage policy: ₹${input.agreedRate} flat rate regardless of overtime.`);
    } else if (dailyPolicy === 'half_full_day_tier') {
      if (netWorkedHoursExact < 5) {
        regularPay = roundCurrency(input.agreedRate * 0.5);
        overtimePay = 0;
        expectedPay = regularPay;
        assumptions.push(`Half-day tier (< 5 hrs worked): 50% of ₹${input.agreedRate} = ₹${expectedPay}.`);
      } else {
        regularPay = roundCurrency(input.agreedRate);
        overtimePay = 0;
        expectedPay = regularPay;
        assumptions.push(`Full-day tier (≥ 5 hrs worked): ₹${expectedPay} daily rate.`);
      }
    } else {
      // standard_8h_ot_pro_rata: full-precision intermediate base hourly rate and overtime rate
      const baseHourlyRate = input.agreedRate / Math.max(1, overtimeThreshold);
      const overtimeHourlyRate = baseHourlyRate * overtimeMultiplier;
      const rawOvertimePay = overtimeHours * overtimeHourlyRate;

      regularPay = roundCurrency(input.agreedRate);
      overtimePay = roundCurrency(rawOvertimePay);
      // Final expected pay rounded from unrounded components
      expectedPay = roundCurrency(input.agreedRate + rawOvertimePay);

      assumptions.push(
        `Standard ${overtimeThreshold}h daily wage base: ₹${input.agreedRate} (₹${roundCurrency(baseHourlyRate)}/hr base).`
      );
      if (overtimeHours > 0) {
        assumptions.push(
          `Overtime pro-rata: ${overtimeHours}h @ ₹${roundCurrency(overtimeHourlyRate)}/hr (${overtimeMultiplier}x) = ₹${overtimePay}.`
        );
      }
    }
  }

  // 11. Payment difference calculation
  // Handle unknown/pending vs zero payment honestly
  const isPaymentSpecified =
    input.paymentReceived !== undefined &&
    input.paymentReceived !== null &&
    input.paymentReceived !== ('' as any);

  let paymentDifference: number | null = null;
  let differenceType: ShiftCalculation['differenceType'] = 'unknown';
  let recordedPaymentValue: number | null = null;

  if (!isPaymentSpecified) {
    assumptions.push('Payment status: Unknown / Pending (not evaluated as ₹0).');
  } else {
    recordedPaymentValue = Number(input.paymentReceived);
    paymentDifference = roundCurrency(expectedPay - recordedPaymentValue);

    if (paymentDifference > 0.5) {
      differenceType = 'shortfall';
      assumptions.push(
        `Possible shortfall detected: Expected ₹${expectedPay} vs Received ₹${recordedPaymentValue} (diff: ₹${paymentDifference}).`
      );
    } else if (paymentDifference < -0.5) {
      differenceType = 'excess';
      assumptions.push(
        `Recorded payment (₹${recordedPaymentValue}) exceeds calculated expectation (₹${expectedPay}).`
      );
    } else {
      differenceType = 'match';
      assumptions.push(`Recorded payment matches calculated expectation (₹${expectedPay}).`);
    }
  }

  assumptions.push('Result is an estimate based on entered worker records and configured pay policies.');

  return {
    elapsedDurationHours: roundCurrency(elapsed),
    unpaidBreakHours: roundCurrency(unpaidBreakHours),
    netWorkedHours,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    expectedPay,
    paymentReceived: recordedPaymentValue,
    paymentDifference,
    differenceType,
    assumptions,
    isValid: true,
  };
}
