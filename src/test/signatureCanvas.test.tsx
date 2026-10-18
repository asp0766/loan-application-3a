import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignatureCanvas } from '../components/signature/SignatureCanvas';

describe('SignatureCanvas Component Unit Tests', () => {
  it('renders signature label and instructions', () => {
    render(<SignatureCanvas label="Primary Borrower Signature" />);
    expect(screen.getByText(/Primary Borrower Signature/i)).toBeInTheDocument();
    expect(screen.getByText(/Draw your legal signature inside the box/i)).toBeInTheDocument();
  });

  it('renders clear canvas button and disables it when canvas is empty', () => {
    render(<SignatureCanvas />);
    const clearBtn = screen.getByRole('button', { name: /Clear Canvas/i });
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn).toBeDisabled();
  });

  it('calls onChange when cleared if signature existed', () => {
    const onChange = vi.fn();
    render(
      <SignatureCanvas
        value="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        onChange={onChange}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Clear Canvas/i });
    expect(clearBtn).not.toBeDisabled();
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
