import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Step5Employment } from '../components/steps/Step5Employment';
import { LoanFormData } from '../types/loan';

const TestStep5Wrapper = () => {
  const form = useForm<LoanFormData>({
    defaultValues: {
      loanType: 'personal',
      employmentType: 'salaried',
      companyName: 'Tata Consultancy Services (TCS)',
      designation: 'Tech Lead',
      monthlyNetSalary: 85000,
      totalWorkExperienceYears: 6,
    },
  });
  return <Step5Employment form={form} />;
};

describe('Step5Employment Component Direct Tests', () => {
  it('renders corporate employment fields for salaried category', () => {
    render(<TestStep5Wrapper />);

    expect(screen.getByText(/Employment & Financial Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Corporate Employment Details/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Tata Consultancy Services/i)).toBeInTheDocument();
  });
});
