import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
        let border = 'border-emerald-200 dark:border-emerald-800';
        let bg = 'bg-white dark:bg-slate-900';

        if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
          border = 'border-amber-200 dark:border-amber-800';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
          border = 'border-indigo-200 dark:border-indigo-800';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${border} ${bg} shadow-lg text-xs text-slate-800 dark:text-slate-200 animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <span className="font-bold block text-slate-900 dark:text-white truncate">
                {toast.title}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
