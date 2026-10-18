import React, { useId } from 'react';
import { ErrorMessage } from './ErrorMessage';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helpText,
  isRequired = false,
  layout = 'vertical',
  className = '',
}) => {
  const groupId = useId();

  const layoutClasses = {
    vertical: 'flex flex-col gap-3',
    horizontal: 'flex flex-row flex-wrap gap-4',
    grid: 'grid grid-cols-1 sm:grid-cols-3 gap-3.5',
  }[layout];

  return (
    <fieldset className={`w-full ${className}`} aria-describedby={error ? `${groupId}-error` : undefined}>
      <legend className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
        {label}
        {isRequired && (
          <span className="text-lendswift-red-600 ml-1 font-bold" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      <div className={layoutClasses} role="radiogroup">
        {options.map((option) => {
          const isSelected = value === option.value;
          const optionId = `${groupId}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`relative flex items-start p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none text-left
                ${
                  isSelected
                    ? 'border-lendswift-blue-500 bg-lendswift-blue-50/50 ring-2 ring-lendswift-blue-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }
              `}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange?.(option.value)}
                className="sr-only"
              />

              <div className="flex items-center h-5 mr-3 mt-0.5">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-lendswift-blue-500 bg-lendswift-blue-500'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {option.icon && <span className="text-lendswift-blue-600">{option.icon}</span>}
                    <span className={`text-sm font-semibold ${isSelected ? 'text-lendswift-blue-900' : 'text-slate-800'}`}>
                      {option.label}
                    </span>
                  </div>
                  {option.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lendswift-green-100 text-lendswift-green-800 uppercase tracking-wide">
                      {option.badge}
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{option.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {helpText && !error && <p className="mt-2 text-xs text-slate-500">{helpText}</p>}
      {error && <ErrorMessage id={`${groupId}-error`} message={error} />}
    </fieldset>
  );
};
