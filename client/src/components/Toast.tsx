import { useToast } from '../stores/toast-store';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-pine-500 text-white';
      case 'error':
        return 'bg-storm-500 text-white';
      case 'warning':
        return 'bg-warm-500 text-white';
      default:
        return 'bg-dawn-500 text-white';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'error':
        return <XCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-paper shadow-paper-hover animate-slide-up max-w-[90vw] ${getColors(toast.type)}`}
        >
          {getIcon(toast.type)}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => remove(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
