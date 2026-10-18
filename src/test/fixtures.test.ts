import { describe, it, expect } from 'vitest';
import personalLoanFixture from './fixtures/valid-personal-loan.json';
import homeLoanFixture from './fixtures/valid-home-loan.json';
import businessLoanFixture from './fixtures/valid-business-loan.json';
import {
  getStep1Schema,
  step2Schema,
  getStep3Schema,
  step4Schema,
  getStep5Schema,
  step6Schema,
  getStep7Schema,
  getStep8Schema,
  isStep6Required,
} from '../schemas/schemaFactory';

describe('Test Fixtures Integrity Validation', () => {
  it('E1.1 - Validates complete Personal Loan fixture through all steps', () => {
    const data = personalLoanFixture as any;

    expect(getStep1Schema().safeParse(data).success).toBe(true);
    expect(step2Schema.safeParse(data).success).toBe(true);
    expect(getStep3Schema(data.loanType, data.loanAmount).safeParse(data).success).toBe(true);
    expect(step4Schema.safeParse(data).success).toBe(true);
    expect(getStep5Schema(data.loanType).safeParse(data).success).toBe(true);
    expect(isStep6Required(data.loanType, data.loanAmount)).toBe(false);
    expect(getStep7Schema(data.loanType, data.employmentType, data.panVerified).safeParse(data).success).toBe(true);
    expect(getStep8Schema(false).safeParse(data).success).toBe(true);
  });

  it('E1.2 - Validates complete Home Loan fixture with Co-Applicant and Property Docs', () => {
    const data = homeLoanFixture as any;

    expect(getStep1Schema().safeParse(data).success).toBe(true);
    expect(step2Schema.safeParse(data).success).toBe(true);
    expect(getStep3Schema(data.loanType, data.loanAmount).safeParse(data).success).toBe(true);
    expect(step4Schema.safeParse(data).success).toBe(true);
    expect(getStep5Schema(data.loanType).safeParse(data).success).toBe(true);
    expect(isStep6Required(data.loanType, data.loanAmount)).toBe(true);
    expect(step6Schema.safeParse(data).success).toBe(true);
    expect(getStep7Schema(data.loanType, data.employmentType, data.panVerified).safeParse(data).success).toBe(true);
    expect(getStep8Schema(false).safeParse(data).success).toBe(true);
  });

  it('E1.3 - Validates complete Business Loan fixture with GSTIN and Business Structure', () => {
    const data = businessLoanFixture as any;

    expect(getStep1Schema().safeParse(data).success).toBe(true);
    expect(step2Schema.safeParse(data).success).toBe(true);
    expect(getStep3Schema(data.loanType, data.loanAmount).safeParse(data).success).toBe(true);
    expect(step4Schema.safeParse(data).success).toBe(true);
    expect(getStep5Schema(data.loanType).safeParse(data).success).toBe(true);
    expect(isStep6Required(data.loanType, data.loanAmount)).toBe(true);
    expect(step6Schema.safeParse(data).success).toBe(true);
    expect(getStep7Schema(data.loanType, data.employmentType, data.panVerified).safeParse(data).success).toBe(true);
    expect(getStep8Schema(false).safeParse(data).success).toBe(true);
  });
});
