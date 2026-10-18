import { describe, it, expect } from 'vitest';
import {
  getStep1Schema,
  step2Schema,
  getStep3Schema,
  step4Schema,
  getStep5Schema,
  step6Schema,
  getStep7Schema,
  getStep8Schema,
} from '../schemas/schemaFactory';

describe('Individual Step Schemas Validation Tests', () => {
  it('Step 1: rejects loan amounts below ₹ 50,000', () => {
    const result = getStep1Schema().safeParse({
      loanType: 'personal',
      loanAmount: 40000,
      loanTenureMonths: 24,
      loanPurpose: 'medical',
    });
    expect(result.success).toBe(false);
  });

  it('Step 2: requires valid 10-digit mobile number starting with 6-9', () => {
    const result = step2Schema.safeParse({
      fullName: 'Rahul Sharma',
      dateOfBirth: '1995-01-01',
      gender: 'male',
      maritalStatus: 'single',
      fathersName: 'Father',
      mothersName: 'Mother',
      email: 'valid@example.com',
      mobileNumber: '1234567890', // Starts with 1 -> invalid
    });
    expect(result.success).toBe(false);
  });

  it('Step 3: requires explicit Aadhaar consent to be true', () => {
    const result = getStep3Schema('personal', 300000).safeParse({
      panNumber: 'ABCPE1234F',
      aadhaarNumber: '999999990019',
      aadhaarConsent: false, // Must be true
    });
    expect(result.success).toBe(false);
  });

  it('Step 4: requires monthly rent when residence type is rented', () => {
    const result = step4Schema.safeParse({
      currentAddress: {
        addressLine1: '123 Test Street, Apartment 4B',
        pinCode: '560001',
        city: 'Bengaluru',
        state: 'Karnataka',
      },
      residenceType: 'rented',
      yearsAtCurrentAddress: 2,
      sameAsPermanentAddress: true,
      monthlyRent: 0, // Invalid rent for rented
    });
    expect(result.success).toBe(false);
  });

  it('Step 5: enforces minimum 2 years vintage for business owners', () => {
    const result = getStep5Schema('business').safeParse({
      employmentType: 'business_owner',
      businessName: 'Apex Exports',
      businessType: 'private_limited',
      businessAnnualTurnover: 5000000,
      yearsInBusiness: 1, // Minimum is 2 years
      businessMonthlyNetProfit: 100000,
      gstNumber: '27ABCPE1234F1Z5',
    });
    expect(result.success).toBe(false);
  });

  it('Step 6: validates co-applicant monthly income threshold (min ₹ 10,000)', () => {
    const result = step6Schema.safeParse({
      coApplicantName: 'Sunita Sharma',
      coApplicantRelationship: 'spouse',
      coApplicantPan: 'ABCPE5678G',
      coApplicantMonthlyIncome: 5000, // Below 10,000
      coApplicantConsent: true,
    });
    expect(result.success).toBe(false);
  });

  it('Step 7: verifies salary slip requirement for salaried applicants', () => {
    const result = getStep7Schema('personal', 'salaried', true).safeParse({
      documents: [
        { docType: 'aadhaar_card' },
        { docType: 'bank_statements' },
        // Missing salary_slips
      ],
      applicantSignature: 'data:image/png;base64,sample',
    });
    expect(result.success).toBe(false);
  });

  it('Step 8: requires all 4 consent declarations to be checked', () => {
    const result = getStep8Schema(false).safeParse({
      consentInformationAccurate: true,
      consentCreditBureauCheck: true,
      consentTermsConditions: true,
      consentCommunications: false, // One missing
    });
    expect(result.success).toBe(false);
  });
});
