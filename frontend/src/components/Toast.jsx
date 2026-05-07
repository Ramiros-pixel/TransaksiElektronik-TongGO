import { useState, useEffect } from 'react';

let toastId = 0;
let externalSetToasts = null;

export const useToastStore = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { externalSetToasts = setToasts; return () => { externalSetToasts = null; }; }, []);
  return toasts;
};

export const toast = {
  show: (msg, type = 'info') => {
    if (!externalSetToasts) return;
    const id = ++toastId;
    externalSetToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      externalSetToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  },
  success: (msg) => toast.show(msg, 'success'),
  error: (msg) => toast.show(msg, 'error'),
  info: (msg) => toast.show(msg, 'info'),
};

const icons = { success: '✅', error: '❌', info: 'ℹ️' };

export default function Toast() {
  const toasts = useToastStore();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{icons[t.type]}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
