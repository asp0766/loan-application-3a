import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaskedInput } from '../components/common/MaskedInput';

describe('MaskedInput Component Unit Tests', () => {
  it('masks PAN number when blurred, displaying only last 4 characters', () => {
    render(<MaskedInput label="PAN Number" value="ABCPE1234F" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('••••••234F');
  });

  it('unmasks PAN number when focused for editing', () => {
    render(<MaskedInput label="PAN Number" value="ABCPE1234F" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.focus(input);
    expect(input.value).toBe('ABCPE1234F');

    fireEvent.blur(input);
    expect(input.value).toBe('••••••234F');
  });

  it('supports eye button toggle to reveal masked value', () => {
    render(<MaskedInput label="Aadhaar" value="999999990019" />);

    const toggleBtn = screen.getByRole('button', { name: /Show Aadhaar/i });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('999999990019');
  });
});
