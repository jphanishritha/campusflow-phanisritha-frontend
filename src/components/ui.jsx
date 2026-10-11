import { useEffect } from 'react';
import { AlertTriangle, Inbox, Loader2, X } from 'lucide-react';
import { PRIORITIES, PROJECT_STATUSES, TASK_STATUSES, avatarColor, initials, labelOf } from '../utils/format.js';

export function Logo({ size = 34, text = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="cfg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f46e5" /><stop offset="0.6" stopColor="#7c3aed" /><stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#cfg)" />
        <path d="M18 40c6-14 14-18 28-16M18 28c6 8 14 10 28 4" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {text && <span className="logo-text">Campus<b>Flow</b></span>}
    </span>
  );
}

export function Spinner({ size = 18 }) {
  return <Loader2 size={size} className="spin" aria-label="Loading" />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader"><Spinner size={28} /><span>{label}</span></div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={26} /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty">
      <div className="empty-icon danger"><AlertTriangle size={26} /></div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Button({ children, variant = 'primary', loading = false, icon: Icon, className = '', ...rest }) {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Spinner size={16} /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

export function Avatar({ name, size = 32 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.38 }} title={name}>
      {initials(name)}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{labelOf([...TASK_STATUSES, ...PROJECT_STATUSES], status)}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge prio-${priority}`}>{labelOf(PRIORITIES, priority)}</span>;
}

export function ProgressBar({ value, height = 8 }) {
  return (
    <div className="progress" style={{ height }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', loading, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="muted">{message}</p>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} type="button">{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, children, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function StatCard({ icon: Icon, label, value, tone = 'indigo', sub }) {
  return (
    <div className="card stat-card">
      <div className={`stat-icon tone-${tone}`}><Icon size={20} /></div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
