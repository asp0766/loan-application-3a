import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from '../components/common/Select';

describe('Select Component Deep Tests', () => {
  it('renders select with placeholder option and required asterisk', () => {
    render(
      <Select
        label="Marital Status"
        isRequired
        placeholder="Choose status"
        options={[
          { value: 'single', label: 'Single' },
          { value: 'married', label: 'Married' },
        ]}
      />
    );

    expect(screen.getByLabelText(/Marital Status/i)).toBeInTheDocument();
    expect(screen.getByText('Choose status')).toBeInTheDocument();
    expect(screen.getByText('Single')).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(
      <Select
        label="Gender"
        error="Gender selection is required"
        options={[{ value: 'male', label: 'Male' }]}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Gender selection is required');
  });
});
