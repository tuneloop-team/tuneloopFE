import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────── */
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContext {
  toast: (message: string, variant?: ToastVariant) => void;
}

/* ─── Context ─────────────────────────────────────────────── */
const ToastCtx = createContext<ToastContext>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

/* ─── Variant config ──────────────────────────────────────── */
const variants: Record<
  ToastVariant,
  { icon: React.ReactNode; bg: string; border: string; text: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-success-500" />,
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-600',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-danger-500" />,
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    text: 'text-danger-600',
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5 text-warning-500" />,
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-600',
  },
  info: {
    icon: <Info className="h-5 w-5 text-primary-500" />,
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-600',
  },
};

/* ─── Provider ────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = String(++idRef.current);
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const v = variants[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-center gap-3 rounded-xl border ${v.border} ${v.bg} px-4 py-3 shadow-glass`}
              >
                {v.icon}
                <p className={`text-sm font-medium ${v.text}`}>{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="ml-2 rounded-lg p-1 transition-colors hover:bg-black/5"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5 text-surface-400" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
