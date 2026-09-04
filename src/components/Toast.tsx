import React from 'react';
import { CheckCircle2, ShoppingBag, Heart, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'cart' | 'wishlist' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3 transform transition-all duration-300 animate-slide-up"
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'cart' && (
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
            )}
            {toast.type === 'wishlist' && (
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-white" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
                <Info className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-sm text-slate-100">{toast.title}</h5>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{toast.message}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
