import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastRefs = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    delete toastRefs.current[id];
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastIdCounter;
    const toast = { id, type, title, message, duration };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      toastRefs.current[id] = setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const toastMethods = useMemo(() => ({
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message, duration: 6000 }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    loading: (title, message) => addToast({ type: 'loading', title, message, duration: 0 }),
    dismiss: (id) => removeToast(id),
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-header">
              <span className="toast-title">
                {t.type === 'success' && '[SYS.OK] '}
                {t.type === 'error' && '[SYS.ERR] '}
                {t.type === 'loading' && '[SYS.RUN] '}
                {t.title}
              </span>
              <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
            </div>
            {t.message && <div className="toast-body">{t.message}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
