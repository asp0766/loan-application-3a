import { describe, it, expect } from 'vitest';
import { getStep1Schema, getStep5Schema, isStep6Required } from '../schemas/schemaFactory';

describe('Schema Factory & Cross-Step Rules', () => {
  describe('isStep6Required (Co-Applicant Thresholds)', () => {
    it('always requires co-applicant for Home Loan', () => {
      expect(isStep6Required('home', 100000)).toBe(true);
      expect(isStep6Required('home', 5000000)).toBe(true);
    });

    it('requires co-applicant for Personal Loan only when amount EXCEEDS 5,00,000 (Section E3.4)', () => {
      // Exactly 5,00,000 does NOT exceed 5,00,000
      expect(isStep6Required('personal', 500000)).toBe(false);
      // 5,00,001 DOES exceed 5,00,000
      expect(isStep6Required('personal', 500001)).toBe(true);
      expect(isStep6Required('personal', 800000)).toBe(true);
    });

    it('requires co-applicant for Business Loan only when amount EXCEEDS 20,00,000', () => {
      expect(isStep6Required('business', 2000000)).toBe(false);
      expect(isStep6Required('business', 2000001)).toBe(true);
    });
  });

  describe('Step 1 Schema Product Limits', () => {
    it('rejects Personal Loan amount exceeding ₹ 10 Lakhs', () => {
      const schema = getStep1Schema();
      const result = schema.safeParse({
        loanType: 'personal',
        loanAmount: 1100000,
        loanTenureMonths: 24,
        loanPurpose: 'Medical',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Personal Loan amount cannot exceed ₹ 10 Lakh');
      }
    });

    it('enforces age + tenure <= 65 years', () => {
      // Applicant is 60 years old (born 60 years ago)
      const today = new Date();
      const birthYear = today.getFullYear() - 60;
      const dob = `${birthYear}-01-01`;

      const schema = getStep1Schema(dob);
      // Asking for 72 months (6 years) -> 60 + 6 = 66 > 65
      const result = schema.safeParse({
        loanType: 'personal',
        loanAmount: 500000,
        loanTenureMonths: 72,
        loanPurpose: 'Wedding',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Step 5 Business Loan Employment Rules', () => {
    it('disallows Salaried employment type for Business Loan', () => {
      const schema = getStep5Schema('business');
      const result = schema.safeParse({
        employmentType: 'salaried',
        companyName: 'Tech Corp',
        designation: 'Engineer',
        monthlyNetSalary: 80000,
        totalWorkExperienceYears: 5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Business Loan requires applicant to be a Business Owner or Self-Employed');
      }
    });
  });
});
