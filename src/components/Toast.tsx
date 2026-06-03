import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stifness: 300, damping: 25 }}
            className={`p-4 rounded-xl border shadow-xl flex gap-3 items-start pointer-events-auto relative overflow-hidden bg-neutral-900 ${
              toast.type === 'success'
                ? 'border-emerald-500/20 shadow-emerald-950/10'
                : toast.type === 'error'
                ? 'border-red-500/20 shadow-red-950/10'
                : 'border-blue-500/20 shadow-blue-950/10'
            }`}
          >
            {/* Action Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" />
              )}
            </div>

            {/* Notification Text */}
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-0.5">
                {toast.type === 'success' ? 'Sucesso' : toast.type === 'error' ? 'Atenção' : 'Aviso'}
              </p>
              <p className="text-sm font-medium text-neutral-200 leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onRemove(toast.id)}
              className="text-neutral-500 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
              aria-label="Agrupar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
