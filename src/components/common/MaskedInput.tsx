import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value?: string;
  onChange?: (val: string) => void;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
  maskPattern?: (val: string) => string;
  rightBadge?: React.ReactNode;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      label,
      value = '',
      onChange,
      error,
      helpText,
      isRequired = false,
      rightBadge,
      id: customId,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const [isFocused, setIsFocused] = useState(false);
    const [showPlain, setShowPlain] = useState(false);

    // Compute masked representation (show only last 4 characters when blurred)
    const getDisplayText = () => {
      if (isFocused || showPlain || !value) {
        return value;
      }
      if (value.length <= 4) return value;
      const maskedPart = '•'.repeat(value.length - 4);
      return maskedPart + value.slice(-4);
    };

    return (
      <div className={`flex flex-col w-full ${className}`}>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
          >
            {label}
            {isRequired && (
              <span className="text-lendswift-red-600 ml-1 font-bold" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {rightBadge}
        </div>

        <div className="relative flex items-center">
          <input
            ref={ref}
            id={id}
            type="text"
            value={getDisplayText()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => onChange?.(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full min-h-[46px] px-3.5 py-2.5 text-sm font-mono tracking-wider text-slate-900 bg-white border rounded-xl transition-all duration-200 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 pr-12
              ${
                error
                  ? 'border-lendswift-red-500 focus:border-lendswift-red-600 focus:ring-2 focus:ring-lendswift-red-100'
                  : 'border-slate-300 hover:border-slate-400 focus:border-lendswift-blue-500 focus:ring-2 focus:ring-lendswift-blue-100'
              }
            `}
            {...props}
          />

          {value && value.length > 4 && (
            <button
              type="button"
              onClick={() => setShowPlain((prev) => !prev)}
              aria-label={showPlain ? `Hide ${label}` : `Show ${label}`}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-lendswift-blue-600"
            >
              {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {helpText && !error && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
        {error && <ErrorMessage id={`${id}-error`} message={error} />}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
