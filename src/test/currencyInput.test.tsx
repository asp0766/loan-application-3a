import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyInput } from '../components/common/CurrencyInput';

describe('CurrencyInput Component Unit Tests', () => {
  it('formats initial value into Indian comma format and displays Lakhs/Crores tag', () => {
    render(<CurrencyInput label="Desired Loan Amount" value={1050000} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('10,50,000');
    expect(screen.getByText('10.5 Lakh')).toBeInTheDocument();
  });

  it('strips non-numeric characters and triggers onChange with integer value', () => {
    const onChange = vi.fn();
    render(<CurrencyInput label="Requested Amount" onChange={onChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5,00,000' } });

    expect(onChange).toHaveBeenCalledWith(500000);
  });

  it('displays minimum and maximum allowable bounds text', () => {
    render(
      <CurrencyInput
        label="Business Capital"
        min={100000}
        max={5000000}
      />
    );

    expect(screen.getByText(/Min: 1 Lakh \| Max: 50 Lakh/i)).toBeInTheDocument();
  });
});
