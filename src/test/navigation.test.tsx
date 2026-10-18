import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepNavigation } from '../components/wizard/StepNavigation';

describe('StepNavigation Component Tests', () => {
  it('hides Back button on step 0', () => {
    render(
      <StepNavigation
        currentStepIndex={0}
        totalSteps={8}
        onPrevious={() => {}}
        onNext={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /Back/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save & Continue/i })).toBeInTheDocument();
  });

  it('shows Back button on step 1 and handles onPrevious callback', () => {
    const onPrevious = vi.fn();
    render(
      <StepNavigation
        currentStepIndex={1}
        totalSteps={8}
        onPrevious={onPrevious}
        onNext={() => {}}
      />
    );

    const backBtn = screen.getByRole('button', { name: /Back/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });
});
