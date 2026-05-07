import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  info:    <Info size={16} />,
};

const COLORS = {
  success: { bg: 'rgba(168,204,48,0.12)', border: 'rgba(168,204,48,0.3)', color: '#a8cc30' },
  error:   { bg: 'rgba(248,99,99,0.12)',  border: 'rgba(248,99,99,0.3)',  color: '#f87171' },
  info:    { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' },
};

function ToastItem({ toast, onRemove }) {
  const c = COLORS[toast.type] || COLORS.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--card)', border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.color}`,
      color: 'var(--text)', padding: '11px 14px',
      borderRadius: 8, minWidth: 260, maxWidth: 360,
      boxShadow: 'var(--shadow-md)',
      animation: 'slideInRight .2s ease',
      fontSize: 13, fontWeight: 500,
    }}>
      <span style={{ color: c.color, flexShrink: 0 }}>{ICONS[toast.type]}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2, display: 'flex' }}>
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{ position: 'fixed', top: 68, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
