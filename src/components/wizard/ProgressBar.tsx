import React from 'react';
import { Check } from 'lucide-react';

export interface StepConfig {
  id: string;
  title: string;
  shortTitle: string;
  stepNumber: number;
}

export interface ProgressBarProps {
  steps: StepConfig[];
  currentStepIndex: number;
  completedStepIndices: number[];
  onStepClick: (index: number) => void;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStepIndex,
  completedStepIndices,
  onStepClick,
  className = '',
}) => {
  const totalSteps = steps.length;
  const currentStepNumber = currentStepIndex + 1;
  const progressPercent = Math.round((currentStepNumber / totalSteps) * 100);

  return (
    <div className={`w-full ${className}`} aria-label={`Loan Application Progress: Step ${currentStepNumber} of ${totalSteps}`}>
      {/* Mobile Compact Progress Bar */}
      <div className="block lg:hidden mb-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-lendswift-blue-900">
            Step {currentStepNumber} of {totalSteps}: {steps[currentStepIndex]?.title}
          </span>
          <span className="font-semibold text-lendswift-blue-600">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-lendswift-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Tracker Bar */}
      <div className="hidden lg:block bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
          {/* Active Filled Progress Line */}
          <div
            className="absolute top-4 left-6 h-0.5 bg-lendswift-blue-500 transition-all duration-300 -z-0"
            style={{
              width: `${(currentStepIndex / (totalSteps - 1)) * 92}%`,
            }}
          />

          {steps.map((step, index) => {
            const isCompleted = completedStepIndices.includes(index);
            const isCurrent = index === currentStepIndex;
            const isClickable = isCompleted || index < currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                className={`relative z-10 flex flex-col items-center group focus:outline-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                    isCompleted
                      ? 'bg-lendswift-green-500 text-white ring-4 ring-lendswift-green-50 shadow-sm'
                      : isCurrent
                      ? 'bg-lendswift-blue-500 text-white ring-4 ring-lendswift-blue-100 shadow-md scale-110'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.stepNumber}
                </div>

                <span
                  className={`mt-2 text-[11px] font-semibold tracking-tight transition-colors whitespace-nowrap text-center ${
                    isCurrent
                      ? 'text-lendswift-blue-900 font-bold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
