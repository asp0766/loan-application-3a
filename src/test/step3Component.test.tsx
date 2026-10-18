import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Step3KYC } from '../components/steps/Step3KYC';
import { LoanFormData } from '../types/loan';

const TestStep3Wrapper = () => {
  const form = useForm<LoanFormData>({
    defaultValues: {
      loanType: 'personal',
      loanAmount: 300000,
      panNumber: 'ABCPE1234F',
      aadhaarNumber: '999999990019',
      aadhaarConsent: true,
    },
  });
  return <Step3KYC form={form} />;
};

describe('Step3KYC Component Direct Tests', () => {
  it('renders simulated KYC notice and identity verification inputs', () => {
    render(<TestStep3Wrapper />);

    expect(screen.getByText(/Identity Verification \(KYC\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic Simulated KYC Environment/i)).toBeInTheDocument();
    expect(screen.getByText(/Explicit Aadhaar e-KYC Verification Consent/i)).toBeInTheDocument();
  });
});
