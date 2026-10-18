import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Step1LoanType } from '../components/steps/Step1LoanType';
import { LoanFormData } from '../types/loan';

const TestStep1Wrapper = () => {
  const form = useForm<LoanFormData>({
    defaultValues: {
      loanType: 'personal',
      loanAmount: 300000,
      loanTenureMonths: 36,
      loanPurpose: 'medical',
    },
  });
  return <Step1LoanType form={form} />;
};

describe('Step1LoanType Component Direct Tests', () => {
  it('renders loan product options and live EMI calculation block', () => {
    render(<TestStep1Wrapper />);

    expect(screen.getByText(/Loan Product & Requirement/i)).toBeInTheDocument();
    expect(screen.getByText(/Indicative Monthly EMI/i)).toBeInTheDocument();
    expect(screen.getAllByText(/10.5% p.a./i).length).toBeGreaterThan(0);
  });
});
