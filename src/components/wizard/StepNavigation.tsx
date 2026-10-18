import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '../common/Button';

export interface StepNavigationProps {
  currentStepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveAndExit?: () => void;
  isNextLoading?: boolean;
  isNextDisabled?: boolean;
  nextButtonLabel?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
  onSaveAndExit,
  isNextLoading = false,
  isNextDisabled = false,
  nextButtonLabel = 'Save & Continue',
}) => {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Debounce ref to prevent state corruption from rapid clicking (Section E3.2)
  const isThrottledRef = useRef(false);

  const handleNextClick = () => {
    if (isThrottledRef.current || isNextLoading || isNextDisabled) return;
    isThrottledRef.current = true;
    onNext();
    setTimeout(() => {
      isThrottledRef.current = false;
    }, 400);
  };

  const handlePreviousClick = () => {
    if (isThrottledRef.current) return;
    isThrottledRef.current = true;
    onPrevious();
    setTimeout(() => {
      isThrottledRef.current = false;
    }, 400);
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 mt-8 no-print">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePreviousClick}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Back
          </Button>
        )}

        {onSaveAndExit && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onSaveAndExit}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto text-slate-600 hover:text-slate-800"
          >
            Save & Exit
          </Button>
        )}
      </div>

      <div className="w-full sm:w-auto">
        {!isLastStep && (
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isNextLoading}
            disabled={isNextDisabled}
            onClick={handleNextClick}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {nextButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
