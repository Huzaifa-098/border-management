import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, AlertTriangle, X, Loader2 } from 'lucide-react';
import {
  subscribeFeedback,
  getLoadingState,
  getToasts,
  dismissToast,
  runApi,
  pushToast,
  parseApiError,
  parseApiSuccess,
  type ToastType,
  type RunApiOptions,
} from '../services/feedbackStore';

export { runApi, pushToast, parseApiError, parseApiSuccess };
export type { RunApiOptions, ToastType };

const toastIcon: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} />,
  error: <XCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const toastGrad: Record<ToastType, string> = {
  success: 'from-emerald-500 to-teal-500',
  error: 'from-rose-500 to-red-500',
  info: 'from-blue-500 to-indigo-500',
  warning: 'from-amber-500 to-orange-500',
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, tick] = useState(0);
  const refresh = useCallback(() => tick((n) => n + 1), []);

  useEffect(() => subscribeFeedback(refresh), [refresh]);

  const loading = getLoadingState();
  const toasts = getToasts();

  return (
    <>
      {children}
      {createPortal(
        <>
          {loading.active && (
            <div className="pbms-global-loader" role="status" aria-live="polite" aria-busy="true">
              <div className="pbms-loader-card vivid-animate-in">
                <div className="pbms-loader-ring">
                  <div>
                    <Loader2 className="pbms-loader-icon" size={36} />
                  </div>
                </div>
                <p className="pbms-loader-text">{loading.message}</p>
                <div className="pbms-loader-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div className="pbms-toast-stack" aria-live="polite">
            {toasts.map((t) => (
              <div key={t.id} className={`pbms-toast pbms-toast-${t.type} vivid-animate-in`}>
                <div className={`pbms-toast-icon bg-gradient-to-br ${toastGrad[t.type]}`}>
                  {toastIcon[t.type]}
                </div>
                <p className="pbms-toast-msg">{t.message}</p>
                <button type="button" className="pbms-toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
};
