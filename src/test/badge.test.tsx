import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/common/Badge';

describe('Badge Component Tests', () => {
  it('renders badge with correct variant colors', () => {
    const { rerender } = render(<Badge variant="success">Verified</Badge>);
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toHaveClass('text-lendswift-green-700');

    rerender(<Badge variant="error">Rejected</Badge>);
    expect(screen.getByText('Rejected')).toHaveClass('text-lendswift-red-700');

    rerender(<Badge variant="warning">Action Needed</Badge>);
    expect(screen.getByText('Action Needed')).toHaveClass('text-lendswift-amber-700');
  });
});
