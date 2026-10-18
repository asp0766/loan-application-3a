import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup } from '../components/common/RadioGroup';

describe('RadioGroup Component Deep Tests', () => {
  it('renders radio options in grid layout with custom badges', () => {
    render(
      <RadioGroup
        label="Select Loan Type"
        name="testLoan"
        layout="grid"
        value="personal"
        options={[
          { value: 'personal', label: 'Personal Loan', badge: '10.5%' },
          { value: 'home', label: 'Home Loan', badge: '8.5%' },
        ]}
      />
    );

    expect(screen.getByText('Select Loan Type')).toBeInTheDocument();
    expect(screen.getByText('Personal Loan')).toBeInTheDocument();
    expect(screen.getByText('10.5%')).toBeInTheDocument();
  });

  it('triggers onChange when another option is selected', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Loan Choice"
        name="choice"
        value="personal"
        onChange={onChange}
        options={[
          { value: 'personal', label: 'Personal' },
          { value: 'home', label: 'Home' },
        ]}
      />
    );

    const homeOption = screen.getByLabelText('Home');
    fireEvent.click(homeOption);
    expect(onChange).toHaveBeenCalledWith('home');
  });
});
