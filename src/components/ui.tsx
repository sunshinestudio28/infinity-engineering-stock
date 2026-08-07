import { type ReactNode } from 'react';

export function StatCard({
  label,
  value,
  sub,
  tone = 'navy',
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: 'navy' | 'green' | 'red' | 'amber';
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    navy: 'border-navy-100 bg-white',
    green: 'border-emerald-100 bg-white',
    red: 'border-rose-100 bg-white',
    amber: 'border-amber-100 bg-white',
  };
  const iconTones: Record<string, string> = {
    navy: 'bg-navy-900 text-white',
    green: 'bg-emerald-600 text-white',
    red: 'bg-rose-600 text-white',
    amber: 'bg-amber-500 text-white',
  };
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-navy-900 mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-navy-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconTones[tone]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-3 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
}) {
  const variants: Record<string, string> = {
    primary: 'bg-navy-900 hover:bg-navy-800 text-white',
    secondary: 'bg-navy-100 hover:bg-navy-200 text-navy-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    ghost: 'hover:bg-navy-50 text-navy-700',
    outline: 'border border-navy-200 hover:bg-navy-50 text-navy-700 bg-white',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-navy-950/50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} my-8 fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
          <h3 className="font-bold text-navy-900">{title}</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-900 text-xl leading-none px-2">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
