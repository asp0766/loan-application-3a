import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Step4Address } from '../components/steps/Step4Address';
import { LoanFormData } from '../types/loan';

const TestStep4Wrapper = () => {
  const form = useForm<LoanFormData>({
    defaultValues: {
      currentAddress: {
        addressLine1: 'Flat 402, Green Meadows',
        pinCode: '560034',
        city: 'Bengaluru',
        state: 'Karnataka',
      },
      residenceType: 'owned',
      yearsAtCurrentAddress: 4,
      sameAsPermanentAddress: true,
    },
  });
  return <Step4Address form={form} />;
};

describe('Step4Address Component Direct Tests', () => {
  it('renders current address fields and permanent address equality checkbox', () => {
    render(<TestStep4Wrapper />);

    expect(screen.getByText(/Residential Address Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Residential Address/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Permanent address is same as current residential address/i)
    ).toBeInTheDocument();
  });
});
