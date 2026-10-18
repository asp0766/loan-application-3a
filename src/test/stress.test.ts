import { describe, it, expect } from 'vitest';
import { validatePAN, validateAadhaarVerhoeff, validateGSTIN, maskPII } from '../utils/validators';
import { formatINR, calculateEMI } from '../utils/emiCalculator';
import { getStep1Schema, step2Schema } from '../schemas/schemaFactory';

describe('QA Stress Testing & Edge Case Defense (Section E3)', () => {
  it('E3.1 - Defends against 100-character maximum length strings in name fields', () => {
    const longName = 'A'.repeat(100);
    const result = step2Schema.safeParse({
      fullName: longName,
      dateOfBirth: '1995-01-01',
      gender: 'male',
      maritalStatus: 'single',
      fathersName: 'Father Name',
      mothersName: 'Mother Name',
      email: 'test@example.com',
      mobileNumber: '9876543210',
    });
    expect(result.success).toBe(true);

    // 101 characters exceeds max length
    const tooLongName = 'A'.repeat(101);
    const failResult = step2Schema.safeParse({
      fullName: tooLongName,
      dateOfBirth: '1995-01-01',
      gender: 'male',
      maritalStatus: 'single',
      fathersName: 'Father Name',
      mothersName: 'Mother Name',
      email: 'test@example.com',
      mobileNumber: '9876543210',
    });
    expect(failResult.success).toBe(false);
  });

  it('E3.2 - Handles special character sanitization in names (alphabets, spaces, periods only)', () => {
    // Valid name with periods and spaces
    expect(
      step2Schema.safeParse({
        fullName: 'Dr. A. P. J. Abdul Kalam',
        dateOfBirth: '1995-01-01',
        gender: 'male',
        maritalStatus: 'single',
        fathersName: 'Jainulabdeen',
        mothersName: 'Ashiamma',
        email: 'test@example.com',
        mobileNumber: '9876543210',
      }).success
    ).toBe(true);

    // Invalid name with numbers or symbols
    expect(
      step2Schema.safeParse({
        fullName: 'Rahul123 #Sharma',
        dateOfBirth: '1995-01-01',
        gender: 'male',
        maritalStatus: 'single',
        fathersName: 'Father',
        mothersName: 'Mother',
        email: 'test@example.com',
        mobileNumber: '9876543210',
      }).success
    ).toBe(false);
  });

  it('E3.3 - Handles edge boundaries for Indian Currency Formatter (zero, negative, multi-crore)', () => {
    expect(formatINR(0)).toBe('₹ 0');
    expect(formatINR(100000000)).toBe('₹ 10,00,00,000'); // 10 Crore
    expect(formatINR(-50000)).toBe('-₹ 50,000');
  });

  it('E3.4 - Handles extreme loan amounts in EMI calculation safely without NaN or Infinity', () => {
    const extreme = calculateEMI(100000000, 360, 'home', 1000000);
    expect(isNaN(extreme.monthlyEmi)).toBe(false);
    expect(isFinite(extreme.monthlyEmi)).toBe(true);
    expect(extreme.monthlyEmi).toBeGreaterThan(0);
  });

  it('E3.5 - PAN and Aadhaar masking handles empty, short, and long inputs safely', () => {
    expect(maskPII('')).toBe('');
    expect(maskPII(null)).toBe('');
    expect(maskPII('123')).toBe('123');
    expect(maskPII('ABCPE1234F')).toBe('••••••234F');
  });
});
