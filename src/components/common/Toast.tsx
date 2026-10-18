import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 className="w-4 h-4 text-lendswift-green-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-lendswift-amber-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-lendswift-red-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-lendswift-blue-600 shrink-0" />,
        }[toast.type];

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-lg transition-all animate-slide-up"
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="text-xs font-medium text-slate-800">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
