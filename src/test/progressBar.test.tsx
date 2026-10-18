import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressBar } from '../components/wizard/ProgressBar';

describe('ProgressBar Component Tests', () => {
  const mockSteps = [
    { id: '1', title: 'Product', shortTitle: '1. Product', stepNumber: 1 },
    { id: '2', title: 'Personal', shortTitle: '2. Personal', stepNumber: 2 },
    { id: '3', title: 'Identity', shortTitle: '3. KYC', stepNumber: 3 },
  ];

  it('renders step completion percentage and active step title in mobile tracker', () => {
    render(
      <ProgressBar
        steps={mockSteps}
        currentStepIndex={1}
        completedStepIndices={[0]}
        onStepClick={() => {}}
      />
    );

    // Step 2 of 3 = 67%
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/67% Completed/i)).toBeInTheDocument();
  });

  it('allows clicking previously completed steps to navigate backwards', () => {
    const onStepClick = vi.fn();
    render(
      <ProgressBar
        steps={mockSteps}
        currentStepIndex={1}
        completedStepIndices={[0]}
        onStepClick={onStepClick}
      />
    );

    // Step 0 was completed -> should be clickable
    const step1Buttons = screen.getAllByRole('button');
    fireEvent.click(step1Buttons[0]);
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});
