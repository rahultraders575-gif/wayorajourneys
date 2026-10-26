import React from 'react';
import { useCms } from '../context/CmsContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useCms();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-md border text-xs font-semibold transition-all transform translate-y-0 ${
              isSuccess
                ? 'bg-white border-red-200 text-slate-800 shadow-red-500/10'
                : isError
                ? 'bg-white border-rose-300 text-slate-800 shadow-rose-500/10'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-500/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-slate-400 shrink-0" />}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
