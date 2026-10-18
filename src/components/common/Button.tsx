import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const sizeClasses = {
      sm: 'min-h-[38px] px-3.5 py-1.5 text-xs gap-1.5',
      md: 'min-h-[44px] px-5 py-2.5 text-sm gap-2', // Meets 44px min touch target
      lg: 'min-h-[50px] px-6 py-3 text-base gap-2.5',
    }[size];

    const variantClasses = {
      primary:
        'bg-lendswift-blue-500 text-white hover:bg-lendswift-blue-600 active:bg-lendswift-blue-700 focus-visible:ring-lendswift-blue-500 shadow-sm',
      secondary:
        'bg-lendswift-green-500 text-white hover:bg-lendswift-green-600 active:bg-lendswift-green-700 focus-visible:ring-lendswift-green-500 shadow-sm',
      outline:
        'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-lendswift-blue-500 shadow-xs',
      danger:
        'bg-lendswift-red-500 text-white hover:bg-lendswift-red-600 active:bg-lendswift-red-700 focus-visible:ring-lendswift-red-500 shadow-sm',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : 'false'}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
