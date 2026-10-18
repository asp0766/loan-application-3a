import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { isStep6Required } from '../schemas/schemaFactory';
import { calculateEMI } from '../utils/emiCalculator';
import { validatePAN, validateAadhaarVerhoeff, validateDOB } from '../utils/validators';

describe('LendSwift End-to-End User Journeys and Critical Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // TEST 1: App renders successfully with LendSwift header and Step 1
  it('E1.1 - Starts successfully and renders LendSwift branded header and Step 1', () => {
    render(<App />);
    expect(screen.getAllByText(/Lend/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Swift/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Loan Product & Requirement/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal Loan/i)).toBeInTheDocument();
    expect(screen.getByText(/Home Loan/i)).toBeInTheDocument();
    expect(screen.getByText(/Business Loan/i)).toBeInTheDocument();
  });

  // TEST 2: Step 1 Validation Errors on empty submit
  it('E1.4 - Step 1 validation displays required field errors when purpose is missing', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click Next without selecting loan purpose
    const nextButton = screen.getByRole('button', { name: /Save & Continue/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please resolve all validation errors/i) ||
        screen.getByText(/Please select a loan purpose/i)
      ).toBeInTheDocument();
    });
  });

  // TEST 3: Switching Loan Products updates constraints and purpose options
  it('E1.15 - Switching between Personal, Home, and Business loans updates terms and purpose dropdown', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select Home Loan
    const homeLoanRadio = screen.getByLabelText(/Home Loan/i);
    await user.click(homeLoanRadio);

    // Expect Home Loan specific purpose option
    expect(screen.getByText(/Purchase of Ready Built Flat \/ House/i)).toBeInTheDocument();

    // Select Business Loan
    const businessLoanRadio = screen.getByLabelText(/Business Loan/i);
    await user.click(businessLoanRadio);

    // Expect Business Loan specific purpose option
    expect(screen.getByText(/Working Capital & Daily Operations/i)).toBeInTheDocument();
  });

  // TEST 4: Co-Applicant Conditional Visibility Logic (Section E3.4 & Day 7)
  it('E1.9 - Step 6 Conditional Visibility: 5,00,000 does NOT trigger Step 6; 5,00,001 DOES trigger Step 6', () => {
    // Exactly 5,00,000 for Personal Loan should NOT require co-applicant
    expect(isStep6Required('personal', 500000)).toBe(false);

    // Exceeding 5,00,000 DOES require co-applicant
    expect(isStep6Required('personal', 500001)).toBe(true);
    expect(isStep6Required('personal', 800000)).toBe(true);

    // Home Loan ALWAYS requires co-applicant
    expect(isStep6Required('home', 500000)).toBe(true);
    expect(isStep6Required('home', 5000000)).toBe(true);

    // Business Loan threshold: 20,00,000
    expect(isStep6Required('business', 2000000)).toBe(false);
    expect(isStep6Required('business', 2000001)).toBe(true);
  });

  // TEST 5: PAN Format & Entity Type Validation
  it('E1.6 - PAN 4th character entity type validation', () => {
    // 4th char is 'P' -> valid individual
    expect(validatePAN('ABCPE1234F', 'personal').isValid).toBe(true);
    expect(validatePAN('ABCPE1234F', 'home').isValid).toBe(true);

    // 4th char is 'C' (Company) -> invalid for personal loan, valid for business loan
    expect(validatePAN('ABCCE1234F', 'personal').isValid).toBe(false);
    expect(validatePAN('ABCCE1234F', 'business').isValid).toBe(true);

    // 4th char is invalid letter 'E'
    const invalidCharResult = validatePAN('ABCDE1234F', 'personal');
    expect(invalidCharResult.isValid).toBe(false);
    expect(invalidCharResult.error).toContain('PAN 4th character must indicate entity type');
  });

  // TEST 6: Aadhaar Verhoeff Checksum Algorithm
  it('E1.6 - Aadhaar Verhoeff checksum algorithm rejects invalid numbers and accepts valid checksums', () => {
    // Valid Aadhaar with Verhoeff checksum 9
    expect(validateAadhaarVerhoeff('999999990019').isValid).toBe(true);

    // Invalid Aadhaar checksum
    expect(validateAadhaarVerhoeff('999999990018').isValid).toBe(false);
    expect(validateAadhaarVerhoeff('123456789012').isValid).toBe(false);
  });

  // TEST 7: Age & DOB Bounds (21 to 65 years)
  it('E1.5 - DOB boundary checks: exactly 21 accepted, under 21 rejected', () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    // Exactly 21 years old today
    const exact21 = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
    expect(validateDOB(fmt(exact21)).isValid).toBe(true);

    // 20 years and 364 days old
    const under21 = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate() + 1);
    const under21Res = validateDOB(fmt(under21));
    expect(under21Res.isValid).toBe(false);
    expect(under21Res.error).toContain('at least 21 years old');
  });

  // TEST 8: EMI Calculator and Affordability Check
  it('E1.8 - Reducing balance EMI formula and debt burden ratio computation', () => {
    // Personal loan: 5L at 10.5% for 36 months, net salary 60k
    const emi = calculateEMI(500000, 36, 'personal', 60000);
    expect(emi.monthlyEmi).toBeGreaterThan(16000);
    expect(emi.processingFee).toBe(5000);
    expect(emi.isHighDebtBurden).toBe(false); // 16k / 60k ~ 27% <= 50%

    // Low income -> high debt burden
    const highDebtEmi = calculateEMI(500000, 36, 'personal', 25000);
    expect(highDebtEmi.isHighDebtBurden).toBe(true); // 16k / 25k ~ 65% > 50%
  });

  // TEST 9: Auto-Save and LocalStorage Persistence
  it('E1.12 - Auto-save writes encrypted draft to localStorage with metadata', async () => {
    render(<App />);

    const saveAndExitBtn = screen.getByRole('button', { name: /Save & Exit/i });
    fireEvent.click(saveAndExitBtn);

    await waitFor(() => {
      const meta = localStorage.getItem('lendswift_draft_meta_personal');
      expect(meta).not.toBeNull();
      if (meta) {
        const parsed = JSON.parse(meta);
        expect(parsed.version).toBe('1.0');
        expect(parsed.loanType).toBe('personal');
      }
    });
  });

  // TEST 10: Step Navigation Throttling prevents rapid-click corruption
  it('E1.14 - Rapid navigation stress test handles repeated button clicks safely', () => {
    render(<App />);
    const nextButton = screen.getByRole('button', { name: /Save & Continue/i });

    // Rapidly trigger clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton);
    }

    // App remains mounted and functional without crashing
    expect(screen.getByText(/Loan Product & Requirement/i)).toBeInTheDocument();
  });
});
