import { createContext, useContext, useState, useCallback } from 'react';
import { HiCheckCircle, HiXCircle, HiExclamationTriangle, HiInformationCircle, HiXMark } from 'react-icons/hi2';
import './Toast.css';

const ToastContext = createContext(null);

const ICONS = {
  success: <HiCheckCircle />,
  error: <HiXCircle />,
  warning: <HiExclamationTriangle />,
  info: <HiInformationCircle />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{ICONS[toast.type]}</span>
            <div className="toast-content">
              <p className="toast-message">{toast.message}</p>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <HiXMark />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
