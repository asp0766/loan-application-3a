import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Checkbox } from '../components/common/Checkbox';

describe('Reusable Common Form Components Library (Compound Pattern)', () => {
  it('renders Input compound component with Label, Field, HelpText and Error', () => {
    render(
      <Input isRequired hasError id="test-input">
        <Input.Label>Official PAN Name</Input.Label>
        <Input.Field placeholder="Enter your name" />
        <Input.HelpText>Must match PAN records exactly</Input.HelpText>
        <Input.Error message="Full legal name is required" />
      </Input>
    );

    expect(screen.getByLabelText(/Official PAN Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/Must match PAN records exactly/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/Full legal name is required/i);
  });

  it('renders Button with variants and accessible loading states', () => {
    const { rerender } = render(<Button variant="primary">Submit Application</Button>);
    const btn = screen.getByRole('button', { name: /Submit Application/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();

    // Rerender with loading state
    rerender(<Button variant="primary" isLoading>Submit Application</Button>);
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('renders Select dropdown with options and handles selection', async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="Residence Type"
        options={[
          { value: 'owned', label: 'Self Owned' },
          { value: 'rented', label: 'Rented' },
        ]}
      />
    );

    const select = screen.getByLabelText(/Residence Type/i);
    expect(select).toBeInTheDocument();
    await user.selectOptions(select, 'rented');
    expect(select).toHaveValue('rented');
  });

  it('renders Checkbox with linked label and accessible error', () => {
    render(
      <Checkbox
        label="I agree to CIBIL credit check"
        description="Mandatory authorization under RBI rules"
        error="You must authorize credit bureau check"
      />
    );

    expect(screen.getByText(/I agree to CIBIL credit check/i)).toBeInTheDocument();
    expect(screen.getByText(/Mandatory authorization under RBI rules/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/You must authorize credit bureau check/i);
  });
});
