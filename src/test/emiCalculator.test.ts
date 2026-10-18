import { describe, it, expect } from 'vitest';
import { calculateEMI, formatINR, formatInLakhsCrores } from '../utils/emiCalculator';

describe('EMI Calculator & Indian Number Formatting', () => {
  it('formats currency according to Indian numbering system (e.g., 10,50,000)', () => {
    expect(formatINR(1050000)).toBe('₹ 10,50,000');
    expect(formatINR(50000)).toBe('₹ 50,000');
    expect(formatINR(10000000)).toBe('₹ 1,00,00,000');
    expect(formatINR(1234567)).toBe('₹ 12,34,567');
  });

  it('formats values in readable Lakhs and Crores', () => {
    expect(formatInLakhsCrores(500000)).toBe('5 Lakh');
    expect(formatInLakhsCrores(10000000)).toBe('1 Crore');
  });

  it('calculates reducing-balance EMI correctly for Personal Loan', () => {
    // 5,00,000 at 10.5% p.a. for 36 months
    // P = 500000, r = 10.5 / 12 / 100 = 0.00875, n = 36
    // EMI approx 16,252
    const result = calculateEMI(500000, 36, 'personal', 50000);
    expect(result.monthlyEmi).toBeGreaterThan(16000);
    expect(result.monthlyEmi).toBeLessThan(16500);
    expect(result.totalInterest).toBeGreaterThan(80000);
    // Processing fee: 1% of 5,00,000 = 5,000
    expect(result.processingFee).toBe(5000);
    expect(result.totalAmountPayable).toBe(500000 + result.totalInterest + 5000);
  });

  it('enforces min 2000 and max 25000 processing fee bounds', () => {
    // 1% of 1,00,000 = 1,000 -> bounded to 2,000
    const smallLoan = calculateEMI(100000, 12, 'personal');
    expect(smallLoan.processingFee).toBe(2000);

    // 1% of 50,00,000 = 50,000 -> bounded to 25,000
    const largeLoan = calculateEMI(5000000, 120, 'business');
    expect(largeLoan.processingFee).toBe(25000);
  });

  it('identifies high debt burden when EMI > 50% of monthly income', () => {
    // Income 20,000, EMI around 16,252 -> >80% ratio -> High debt burden
    const highRatio = calculateEMI(500000, 36, 'personal', 20000);
    expect(highRatio.isHighDebtBurden).toBe(true);
    expect(highRatio.emiToIncomeRatio).toBeGreaterThan(50);

    // Income 1,00,000, EMI 16,252 -> ~16.3% ratio -> Safe
    const safeRatio = calculateEMI(500000, 36, 'personal', 100000);
    expect(safeRatio.isHighDebtBurden).toBe(false);
  });
});
