import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Step2PersonalInfo } from '../components/steps/Step2PersonalInfo';
import { LoanFormData } from '../types/loan';

const TestStep2Wrapper = () => {
  const form = useForm<LoanFormData>({
    defaultValues: {
      fullName: 'Rahul Sharma',
      dateOfBirth: '1995-05-15',
      gender: 'male',
      maritalStatus: 'single',
      fathersName: 'Ramesh Sharma',
      mothersName: 'Sunita Sharma',
      email: 'rahul@example.com',
      mobileNumber: '9876543210',
    },
  });
  return <Step2PersonalInfo form={form} />;
};

describe('Step2PersonalInfo Component Direct Tests', () => {
  it('renders personal details and opens simulated OTP modal on button click', () => {
    render(<TestStep2Wrapper />);

    expect(screen.getByText(/Personal Information/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rahul Sharma')).toBeInTheDocument();

    const verifyOtpBtn = screen.getByRole('button', { name: /Verify OTP/i });
    expect(verifyOtpBtn).toBeInTheDocument();

    fireEvent.click(verifyOtpBtn);
    expect(screen.getByText(/Simulated Mobile OTP Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Use Demo Code:/i)).toBeInTheDocument();
  });
});
