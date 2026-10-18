import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastContainer } from '../components/common/Toast';

describe('ToastContainer Component Tests', () => {
  it('renders status message with auto-dismiss button', () => {
    const onDismiss = vi.fn();
    render(
      <ToastContainer
        toasts={[
          { id: '1', type: 'success', message: 'Draft saved at 10:30 AM' },
          { id: '2', type: 'error', message: 'Failed to verify PAN' },
        ]}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('Draft saved at 10:30 AM')).toBeInTheDocument();
    expect(screen.getByText('Failed to verify PAN')).toBeInTheDocument();

    const dismissBtns = screen.getAllByLabelText(/Dismiss toast/i);
    expect(dismissBtns.length).toBe(2);
    fireEvent.click(dismissBtns[0]);
    expect(onDismiss).toHaveBeenCalledWith('1');
  });
});
