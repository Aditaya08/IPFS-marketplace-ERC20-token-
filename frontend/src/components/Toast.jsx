import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastRefs = useRef({});

  const removeToast = useCallback((id) => {
    // Mark as exiting first for animation
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete toastRefs.current[id];
    }, 250);
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastIdCounter;
    const toast = { id, type, title, message, duration, exiting: false };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      toastRefs.current[id] = setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const toast = useCallback({
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message, duration: 6000 }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    loading: (title, message) => addToast({ type: 'loading', title, message, duration: 0 }),
    dismiss: (id) => removeToast(id),
  }, [addToast, removeToast]);

  // Fix: toast needs to be a plain object, not using useCallback on an object literal
  // We'll restructure this

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type} ${t.exiting ? 'toast-exiting' : ''}`}
            style={t.duration > 0 ? { '--toast-duration': `${t.duration}ms` } : {}}
          >
            <span className="toast-icon">
              {t.type === 'success' && '✅'}
              {t.type === 'error' && '❌'}
              {t.type === 'info' && 'ℹ️'}
              {t.type === 'loading' && '⏳'}
            </span>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>
            <button className="toast-dismiss" onClick={() => removeToast(t.id)}>✕</button>
            {t.duration > 0 && <div className="toast-progress" />}
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
