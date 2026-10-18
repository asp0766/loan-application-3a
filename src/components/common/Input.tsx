import React, { createContext, useContext, useId } from 'react';
import { ErrorMessage } from './ErrorMessage';

interface InputContextValue {
  id: string;
  hasError: boolean;
  isRequired?: boolean;
}

const InputContext = createContext<InputContextValue | null>(null);

export interface InputRootProps {
  children: React.ReactNode;
  id?: string;
  hasError?: boolean;
  isRequired?: boolean;
  className?: string;
}

export const InputRoot: React.FC<InputRootProps> = ({
  children,
  id: customId,
  hasError = false,
  isRequired = false,
  className = '',
}) => {
  const generatedId = useId();
  const id = customId || generatedId;

  return (
    <InputContext.Provider value={{ id, hasError, isRequired }}>
      <div className={`flex flex-col w-full ${className}`}>{children}</div>
    </InputContext.Provider>
  );
};

export interface InputLabelProps {
  children: React.ReactNode;
  className?: string;
  optional?: boolean;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  children,
  className = '',
  optional = false,
}) => {
  const ctx = useContext(InputContext);
  return (
    <label
      htmlFor={ctx?.id}
      className={`block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ${className}`}
    >
      {children}
      {ctx?.isRequired && !optional && (
        <span className="text-lendswift-red-600 ml-1 font-bold" aria-hidden="true">
          *
        </span>
      )}
      {optional && <span className="text-slate-400 font-normal normal-case ml-1.5">(Optional)</span>}
    </label>
  );
};

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className = '', leftIcon, rightElement, id: propId, ...props }, ref) => {
    const ctx = useContext(InputContext);
    const id = propId || ctx?.id;
    const hasError = ctx?.hasError;

    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`w-full min-h-[46px] px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-xl transition-all duration-200 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${
              hasError
                ? 'border-lendswift-red-500 focus:border-lendswift-red-600 focus:ring-2 focus:ring-lendswift-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-lendswift-blue-500 focus:ring-2 focus:ring-lendswift-blue-100'
            }
            ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">{rightElement}</div>
        )}
      </div>
    );
  }
);
InputField.displayName = 'Input.Field';

export interface InputErrorProps {
  message?: string;
  className?: string;
}

export const InputError: React.FC<InputErrorProps> = ({ message, className = '' }) => {
  const ctx = useContext(InputContext);
  if (!message) return null;
  return <ErrorMessage id={ctx ? `${ctx.id}-error` : undefined} message={message} className={className} />;
};

export interface InputHelpTextProps {
  children: React.ReactNode;
  className?: string;
}

export const InputHelpText: React.FC<InputHelpTextProps> = ({ children, className = '' }) => {
  return <p className={`mt-1.5 text-xs text-slate-500 ${className}`}>{children}</p>;
};

// Convenience Compound Component
export const Input = Object.assign(InputRoot, {
  Label: InputLabel,
  Field: InputField,
  Error: InputError,
  HelpText: InputHelpText,
});
