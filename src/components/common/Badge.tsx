import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  const variantClasses = {
    success: 'bg-lendswift-green-50 text-lendswift-green-700 border border-lendswift-green-200',
    warning: 'bg-lendswift-amber-50 text-lendswift-amber-700 border border-lendswift-amber-200',
    error: 'bg-lendswift-red-50 text-lendswift-red-700 border border-lendswift-red-200',
    info: 'bg-lendswift-blue-50 text-lendswift-blue-700 border border-lendswift-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
