import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../components/common/Checkbox';

describe('Checkbox Component Deep Tests', () => {
  it('renders checkmark when checked is true', () => {
    const { rerender } = render(
      <Checkbox label="Agree to Terms" checked={false} onChange={() => {}} />
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    rerender(<Checkbox label="Agree to Terms" checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('triggers onChange when clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Agree to Terms" checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByText('Agree to Terms'));
    expect(onChange).toHaveBeenCalled();
  });
});
