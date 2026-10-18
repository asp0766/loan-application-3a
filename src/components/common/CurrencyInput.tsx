import React, { useId, useState, useEffect } from 'react';
import { formatINR, formatInLakhsCrores } from '../../utils/emiCalculator';
import { ErrorMessage } from './ErrorMessage';

export interface CurrencyInputProps {
  label: string;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value = 0,
  onChange,
  error,
  helpText,
  isRequired = false,
  min,
  max,
  id: customId,
  placeholder = 'Enter amount in INR',
  className = '',
}) => {
  const generatedId = useId();
  const id = customId || generatedId;

  // Local display text with Indian commas
  const [displayText, setDisplayText] = useState<string>(() => (value ? formatINR(value, false) : ''));

  useEffect(() => {
    if (value !== undefined) {
      setDisplayText(value > 0 ? formatINR(value, false) : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setDisplayText('');
      onChange?.(0);
      return;
    }
    const num = parseInt(rawVal, 10);
    setDisplayText(formatINR(num, false));
    onChange?.(num);
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
        {value > 0 && (
          <span className="text-xs font-medium text-lendswift-blue-600 bg-lendswift-blue-50 px-2 py-0.5 rounded-full">
            {formatInLakhsCrores(value)}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-400 font-semibold text-sm pointer-events-none select-none">
          ₹
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayText}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full min-h-[46px] pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border rounded-xl transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal
            ${
              error
                ? 'border-lendswift-red-500 focus:border-lendswift-red-600 focus:ring-2 focus:ring-lendswift-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-lendswift-blue-500 focus:ring-2 focus:ring-lendswift-blue-100'
            }
          `}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500">
        <div>{helpText && !error && <span>{helpText}</span>}</div>
        {min !== undefined && max !== undefined && (
          <span className="text-[11px] text-slate-400">
            Min: {formatInLakhsCrores(min)} | Max: {formatInLakhsCrores(max)}
          </span>
        )}
      </div>

      {error && <ErrorMessage id={`${id}-error`} message={error} />}
    </div>
  );
};
