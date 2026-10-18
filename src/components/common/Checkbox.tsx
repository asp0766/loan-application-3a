import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, id: customId, className = '', checked, onChange, ...props }, ref) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <div className={`flex flex-col w-full ${className}`}>
        <label
          htmlFor={id}
          className="relative flex items-start gap-3 select-none cursor-pointer group"
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={id}
              checked={checked}
              onChange={onChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              className="sr-only"
              {...props}
            />
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150
                ${
                  checked
                    ? 'border-lendswift-blue-500 bg-lendswift-blue-500 text-white'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                }
                ${error ? 'border-lendswift-red-500' : ''}
              `}
            >
              {checked && <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />}
            </div>
          </div>

          <div className="flex-1 text-sm">
            <span className="font-medium text-slate-800 leading-snug block">{label}</span>
            {description && (
              <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                {description}
              </span>
            )}
          </div>
        </label>
        {error && <ErrorMessage id={`${id}-error`} message={error} className="ml-8" />}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
