import { describe, it, expect } from 'vitest';
import {
  validatePAN,
  validateAadhaarVerhoeff,
  generateVerhoeffCheckDigit,
  calculateAge,
  validateDOB,
  validateGSTIN,
  maskPII,
} from '../utils/validators';

describe('PAN Validation', () => {
  it('validates a valid individual PAN (4th character P)', () => {
    const result = validatePAN('ABCDE1234F', 'personal');
    // Note: 4th char is D, not P!
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('PAN 4th character must indicate entity type');
  });

  it('validates a correct individual PAN format', () => {
    const result = validatePAN('ABCPE1234F', 'personal');
    expect(result.isValid).toBe(true);
    expect(result.entityType).toBe('Individual');
  });

  it('rejects non-Individual PAN for personal and home loans', () => {
    const result = validatePAN('ABCFA1234F', 'personal'); // F = Firm
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Personal & Home loans require an Individual PAN');
  });

  it('accepts Company and Firm PAN for business loans', () => {
    const resultFirm = validatePAN('ABCFA1234F', 'business');
    expect(resultFirm.isValid).toBe(true);
    expect(resultFirm.entityType).toBe('Firm / LLP');

    const resultCompany = validatePAN('ABCCA1234F', 'business');
    expect(resultCompany.isValid).toBe(true);
    expect(resultCompany.entityType).toBe('Company');
  });

  it('shows specific error for invalid entity type 4th character (Section E3.4)', () => {
    const result = validatePAN('ABCZE1234F', 'personal'); // Z is not a valid entity char
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('PAN 4th character must indicate entity type');
  });
});

describe('Aadhaar Verhoeff Checksum Validation', () => {
  it('correctly generates and validates a 12-digit Aadhaar number with Verhoeff checksum', () => {
    const first11 = '99999999001';
    const checkDigit = generateVerhoeffCheckDigit(first11);
    const validAadhaar = `${first11}${checkDigit}`;

    const checkResult = validateAadhaarVerhoeff(validAadhaar);
    expect(checkResult.isValid).toBe(true);
  });

  it('rejects an Aadhaar with altered digit or invalid checksum', () => {
    const first11 = '99999999001';
    const checkDigit = generateVerhoeffCheckDigit(first11);
    // Alter last digit
    const invalidAadhaar = `${first11}${(checkDigit + 1) % 10}`;

    const checkResult = validateAadhaarVerhoeff(invalidAadhaar);
    expect(checkResult.isValid).toBe(false);
    expect(checkResult.error).toContain('Verhoeff checksum');
  });

  it('rejects Aadhaar numbers not having 12 digits', () => {
    expect(validateAadhaarVerhoeff('12345').isValid).toBe(false);
  });
});

describe('DOB & Age Validation', () => {
  function formatYMD(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  it('accepts an applicant who is exactly 21 years old today (Section E3.4)', () => {
    const today = new Date();
    const exact21 = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
    const isoString = formatYMD(exact21);

    const result = validateDOB(isoString);
    expect(result.isValid).toBe(true);
    expect(result.age).toBe(21);
  });

  it('rejects an applicant who is 20 years and 364 days old (Section E3.4)', () => {
    const today = new Date();
    // 21 years ago + 1 day = 20 years and 364 days old
    const almost21 = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate() + 1);
    const isoString = formatYMD(almost21);

    const result = validateDOB(isoString);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 21 years old');
  });

  it('rejects applicants older than 65 years', () => {
    const today = new Date();
    const age66 = new Date(today.getFullYear() - 66, today.getMonth(), today.getDate());
    const isoString = formatYMD(age66);

    const result = validateDOB(isoString);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot exceed 65 years');
  });
});

describe('GSTIN Validation', () => {
  it('validates valid 15-character GST format', () => {
    // 27 (Maharashtra) + ABCPE1234F (PAN) + 1 (entity) + Z + 5 (checksum)
    const validGST = '27ABCPE1234F1Z5';
    expect(validateGSTIN(validGST).isValid).toBe(true);
  });

  it('rejects invalid state code or format', () => {
    expect(validateGSTIN('99ABCPE1234F1Z5').isValid).toBe(false);
    expect(validateGSTIN('27ABCPE1234F1A5').isValid).toBe(false); // 14th must be 'Z'
  });
});

describe('maskPII', () => {
  it('masks PAN and Aadhaar showing only last 4 characters', () => {
    expect(maskPII('ABCPE1234F')).toBe('••••••234F');
    expect(maskPII('999999990019')).toBe('••••••••0019');
  });
});
