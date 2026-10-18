import { LoanType } from '../types/loan';

/**
 * Verhoeff algorithm tables for Aadhaar checksum validation
 */
// Multiplication table (d)
const VERHOEFF_D: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Permutation table (p)
const VERHOEFF_P: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Inverse table (inv)
export const VERHOEFF_INV: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a 12-digit Aadhaar number using the Verhoeff algorithm.
 * The checksum across all 12 digits must equal 0.
 */
export function validateAadhaarVerhoeff(aadhaar: string): { isValid: boolean; error?: string } {
  const clean = aadhaar.replace(/\s+/g, '');
  if (!clean) {
    return { isValid: false, error: 'Aadhaar number is required' };
  }
  if (!/^\d{12}$/.test(clean)) {
    return { isValid: false, error: 'Aadhaar must be exactly 12 digits' };
  }

  let c = 0;
  // Read digits in reverse order
  const reversedArray = clean.split('').reverse().map(Number);

  for (let i = 0; i < reversedArray.length; i++) {
    const digit = reversedArray[i];
    const permuted = VERHOEFF_P[i % 8][digit];
    c = VERHOEFF_D[c][permuted];
  }

  if (c !== 0) {
    return { isValid: false, error: 'Invalid Aadhaar number (Verhoeff checksum verification failed)' };
  }

  return { isValid: true };
}

/**
 * Generates a valid Verhoeff checksum digit for an 11-digit string (useful for demo generators and tests)
 */
export function generateVerhoeffCheckDigit(first11Digits: string): number {
  const reversedArray = first11Digits.split('').reverse().map(Number);
  let c = 0;
  for (let i = 0; i < reversedArray.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][reversedArray[i]]];
  }
  return VERHOEFF_INV[c];
}

/**
 * Valid PAN entity types according to Income Tax Department
 */
export const PAN_ENTITY_TYPES: Record<string, string> = {
  P: 'Individual',
  C: 'Company',
  H: 'HUF (Hindu Undivided Family)',
  A: 'AOP (Association of Persons)',
  B: 'BOI (Body of Individuals)',
  G: 'Government',
  J: 'Artificial Juridical Person',
  L: 'Local Authority',
  F: 'Firm / LLP',
  T: 'Trust',
};

/**
 * Validates Indian PAN card format and entity type according to loan product rules
 */
export function validatePAN(
  pan: string,
  loanType: LoanType = 'personal'
): { isValid: boolean; error?: string; entityType?: string } {
  if (!pan) {
    return { isValid: false, error: 'PAN number is required' };
  }

  const upper = pan.trim().toUpperCase();

  if (upper.length !== 10) {
    return { isValid: false, error: 'PAN must be exactly 10 characters in format AAAAA9999A' };
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(upper)) {
    return { isValid: false, error: 'PAN format must be 5 letters, 4 digits, and 1 letter (e.g., ABCDE1234F)' };
  }

  const fourthChar = upper[3];
  const entity = PAN_ENTITY_TYPES[fourthChar];

  if (!entity) {
    return {
      isValid: false,
      error: 'PAN 4th character must indicate entity type (P for Individual, C for Company, etc.)',
    };
  }

  // Business logic rules:
  // Personal & Home loans: only P (Individual) accepted
  // Business loan: P, C, or F accepted
  if (loanType === 'personal' || loanType === 'home') {
    if (fourthChar !== 'P') {
      return {
        isValid: false,
        error: `Personal & Home loans require an Individual PAN (4th character 'P'). Provided PAN is for ${entity}.`,
      };
    }
  } else if (loanType === 'business') {
    if (!['P', 'C', 'F'].includes(fourthChar)) {
      return {
        isValid: false,
        error: `Business loans require an Individual ('P'), Company ('C'), or Firm ('F') PAN. Provided PAN is for ${entity}.`,
      };
    }
  }

  return { isValid: true, entityType: entity };
}

/**
 * Calculates accurate age from Date of Birth (YYYY-MM-DD)
 */
export function parseDateString(dateString: string): { year: number; month: number; day: number } | null {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

/**
 * Calculates accurate age from Date of Birth (YYYY-MM-DD)
 */
export function calculateAge(dobString: string, referenceDate: Date = new Date()): number {
  const parts = parseDateString(dobString);
  if (!parts) return 0;

  let age = referenceDate.getFullYear() - parts.year;
  const monthDiff = referenceDate.getMonth() - parts.month;

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < parts.day)) {
    age--;
  }

  return age;
}

/**
 * Validates Date of Birth for age 21 to 65 years.
 * Specifically checks: exactly 21 years old today is accepted; 20 years 364 days old is rejected.
 */
export function validateDOB(dobString: string): { isValid: boolean; age: number; error?: string } {
  const parts = parseDateString(dobString);
  if (!parts) {
    return { isValid: false, age: 0, error: 'Date of birth is required' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Exact 21st birthday threshold date (birth must be on or before this date)
  const minBirthDate = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
  // Exact 65th birthday threshold date (birth must be on or after this date)
  const maxBirthDate = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());

  const userDate = new Date(parts.year, parts.month, parts.day);

  if (userDate > minBirthDate) {
    return {
      isValid: false,
      age: calculateAge(dobString, today),
      error: 'Applicant must be at least 21 years old. Minimum age requirement is not met.',
    };
  }

  if (userDate < maxBirthDate) {
    return {
      isValid: false,
      age: calculateAge(dobString, today),
      error: 'Applicant age cannot exceed 65 years as per RBI lending guidelines.',
    };
  }

  const age = calculateAge(dobString, today);
  return { isValid: true, age };
}

/**
 * Validates GSTIN (Goods and Services Tax Identification Number)
 * 15 characters:
 * - 2 digits: State code (01 to 37)
 * - 10 characters: PAN of the entity
 * - 1 digit: Entity number of the same PAN in the state (1-9 or A-Z)
 * - 1 character: Alphabet 'Z' by default
 * - 1 character: Checksum digit / character
 */
export function validateGSTIN(gstin: string): { isValid: boolean; error?: string } {
  if (!gstin) {
    return { isValid: false, error: 'GST Number is required for Business loans' };
  }

  const upper = gstin.trim().toUpperCase();

  if (upper.length !== 15) {
    return { isValid: false, error: 'GST number must be exactly 15 characters' };
  }

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(upper)) {
    return {
      isValid: false,
      error: 'Invalid GST format. Format: 2-digit state code + 10-char PAN + 1 entity char + Z + 1 checksum',
    };
  }

  const stateCode = parseInt(upper.substring(0, 2), 10);
  if (stateCode < 1 || stateCode > 38) {
    return { isValid: false, error: 'First 2 digits must be a valid Indian State code (01-38)' };
  }

  return { isValid: true };
}

/**
 * Mask PII fields for safe rendering (shows only last 4 characters)
 */
export function maskPII(value: string | undefined | null, visibleLast: number = 4): string {
  if (!value) return '';
  const str = String(value).trim();
  if (str.length <= visibleLast) return str;
  const maskedLength = str.length - visibleLast;
  return '•'.repeat(maskedLength) + str.slice(-visibleLast);
}
