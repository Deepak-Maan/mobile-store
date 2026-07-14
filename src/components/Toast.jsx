import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Check, AlertTriangle, XCircle } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="toast-container" style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 300, display: 'flex', flexDirection: 'column', gap: '0.8rem', pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onRemove: _onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.9, transition: { duration: 0.2 } }}
      className={`toast ${toast.type}`}
      style={{ pointerEvents: 'auto' }}
    >
      <span className="toast-icon-box">
        {toast.type === 'success' && <Check className="toast-icon success" />}
        {toast.type === 'error' && <XCircle className="toast-icon error" />}
        {toast.type === 'warning' && <AlertTriangle className="toast-icon warning" />}
      </span>
      <span className="toast-message" style={{ fontFamily: 'var(--font-body)' }}>{toast.message}</span>
    </motion.div>
  );
};
