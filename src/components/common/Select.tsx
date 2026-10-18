import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helpText?: string;
  isRequired?: boolean;
  optional?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helpText,
      isRequired = false,
      optional = false,
      placeholder = 'Select an option',
      id: customId,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <div className="flex flex-col w-full">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
          {isRequired && !optional && (
            <span className="text-lendswift-red-600 ml-1 font-bold" aria-hidden="true">
              *
            </span>
          )}
          {optional && <span className="text-slate-400 font-normal normal-case ml-1.5">(Optional)</span>}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full min-h-[46px] px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-xl appearance-none transition-all duration-200 pr-10 disabled:bg-slate-100 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-lendswift-red-500 focus:border-lendswift-red-600 focus:ring-2 focus:ring-lendswift-red-100'
                  : 'border-slate-300 hover:border-slate-400 focus:border-lendswift-blue-500 focus:ring-2 focus:ring-lendswift-blue-100'
              }
              ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        {helpText && !error && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
        {error && <ErrorMessage id={`${id}-error`} message={error} />}
      </div>
    );
  }
);

Select.displayName = 'Select';
