import { LoanType, EMICalculationResult } from '../types/loan';

/**
 * Annual interest rates by loan product
 */
export const ANNUAL_INTEREST_RATES: Record<LoanType, number> = {
  personal: 10.5,
  home: 8.5,
  business: 14.0,
};

/**
 * Formats a number to Indian numbering system (e.g. 10,50,000)
 */
export function formatINR(value: number | undefined | null, includeSymbol: boolean = true): string {
  if (value === undefined || value === null || isNaN(value)) {
    return includeSymbol ? '₹ 0' : '0';
  }

  const rounded = Math.round(value);
  const isNegative = rounded < 0;
  const absValue = Math.abs(rounded);

  const str = absValue.toString();
  let result = '';

  if (str.length <= 3) {
    result = str;
  } else {
    // Last 3 digits
    const lastThree = str.substring(str.length - 3);
    const remaining = str.substring(0, str.length - 3);
    // Group remaining into pairs of 2 from right to left
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedRemaining},${lastThree}`;
  }

  const prefix = isNegative ? '-' : '';
  return includeSymbol ? `${prefix}₹ ${result}` : `${prefix}${result}`;
}

/**
 * Calculates Reducing Balance EMI and borrowing costs
 */
export function calculateEMI(
  principal: number,
  tenureMonths: number,
  loanType: LoanType,
  monthlyIncome: number = 0,
  coApplicantIncome: number = 0
): EMICalculationResult {
  const p = Math.max(0, principal || 0);
  const n = Math.max(1, tenureMonths || 12);
  const annualRate = ANNUAL_INTEREST_RATES[loanType] || 10.5;
  const r = annualRate / 12 / 100;

  let monthlyEmi = 0;
  if (p > 0 && r > 0 && n > 0) {
    const factor = Math.pow(1 + r, n);
    monthlyEmi = Math.round((p * r * factor) / (factor - 1));
  }

  const totalRepayment = monthlyEmi * n;
  const totalInterest = Math.max(0, totalRepayment - p);

  // Processing Fee: 1% of loan amount (min INR 2,000, max INR 25,000)
  let processingFee = 0;
  if (p > 0) {
    const rawFee = Math.round(p * 0.01);
    processingFee = Math.max(2000, Math.min(25000, rawFee));
  }

  const totalAmountPayable = p + totalInterest + processingFee;

  // Total household eligible monthly income
  const totalMonthlyIncome = Math.max(0, monthlyIncome + coApplicantIncome);
  const emiToIncomeRatio = totalMonthlyIncome > 0 ? (monthlyEmi / totalMonthlyIncome) * 100 : 0;
  const isHighDebtBurden = emiToIncomeRatio > 50;
  const maxAffordableEmi = Math.round(totalMonthlyIncome * 0.5);

  return {
    principal: p,
    annualInterestRate: annualRate,
    monthlyInterestRate: r,
    tenureMonths: n,
    monthlyEmi,
    totalInterest,
    processingFee,
    totalAmountPayable,
    emiToIncomeRatio: Math.round(emiToIncomeRatio * 10) / 10,
    isHighDebtBurden,
    maxAffordableEmi,
  };
}

/**
 * Converts numbers into Indian text words (e.g. 5,00,000 -> 5 Lakhs)
 */
export function formatInLakhsCrores(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
  }
  return formatINR(value);
}
