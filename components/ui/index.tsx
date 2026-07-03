import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, LucideIcon, ChevronLeft, ChevronRight, X, Sparkles, AlertTriangle } from 'lucide-react';
import { LogoImage } from '../LogoImage';
import type { PaginationMeta } from '../../services/api';

export type { PaginationMeta };

const STAT_GRADS = [
  'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #f43f5e 0%, #e879f9 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
];

/* ─── Modal ─── */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  color?: 'violet' | 'cyan' | 'orange' | 'rose';
}> = ({ open, onClose, title, subtitle, children, size = 'md', footer, color = 'violet' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  const headerGrad = {
    violet: 'from-violet-600 via-purple-600 to-indigo-600',
    cyan: 'from-cyan-500 via-blue-500 to-indigo-500',
    orange: 'from-orange-500 via-amber-500 to-yellow-500',
    rose: 'from-rose-500 via-pink-500 to-fuchsia-500',
  }[color];

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md" />
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col`}
        style={{ boxShadow: '0 25px 60px -12px rgb(88 28 135 / 0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-6 py-5 bg-gradient-to-r ${headerGrad} text-white shrink-0`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">{title}</h3>
              {subtitle && <p className="text-white/80 text-sm mt-1 font-medium">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-white to-violet-50/30">{children}</div>
        {footer && <div className="px-6 py-4 border-t-2 border-violet-100 bg-white shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

/* ─── Confirm Dialog (delete / destructive actions) ─── */
export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  message,
  confirmLabel = 'Yes, Delete',
  cancelLabel = 'No, Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-indigo-950/65 backdrop-blur-md" />
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden vivid-animate-in"
        style={{ boxShadow: '0 25px 60px -12px rgb(244 63 94 / 0.35)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 border border-white/30">
              <AlertTriangle size={22} />
            </div>
            <h3 className="font-extrabold text-lg leading-tight">{title}</h3>
          </div>
        </div>
        <div className="p-6 bg-gradient-to-b from-white to-rose-50/40">
          <p className="text-slate-600 text-sm leading-relaxed font-medium">{message}</p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-violet-700 bg-white border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="vivid-btn vivid-btn-rose px-5 py-2.5"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const useConfirm = () => {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  const ConfirmDialogEl = (
    <ConfirmDialog
      open={!!pending}
      title={pending?.title ?? ''}
      message={pending?.message ?? ''}
      confirmLabel={pending?.confirmLabel}
      cancelLabel={pending?.cancelLabel}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { confirm, ConfirmDialog: ConfirmDialogEl };
};

export const FormField: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string }> = ({
  label, hint, children, className = '',
}) => (
  <div className={className}>
    <label className="block text-xs font-extrabold text-violet-700 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1 font-medium">{hint}</p>}
  </div>
);

export const FilterPills: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {options.map((opt, i) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
          value === opt.value
            ? 'text-white shadow-lg scale-105'
            : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-violet-200'
        }`}
        style={value === opt.value ? { background: STAT_GRADS[i % STAT_GRADS.length] } : undefined}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const EntityCard: React.FC<{
  avatar?: React.ReactNode;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'highlight';
}> = ({ avatar, title, subtitle, badges, meta, actions, onClick, variant = 'default' }) => (
  <div
    onClick={onClick}
    className={`vivid-entity ${variant === 'danger' ? 'vivid-entity-danger' : ''} ${variant === 'highlight' ? '!border-cyan-300 !bg-gradient-to-r !from-cyan-50 !to-white' : ''} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {avatar && <div className="shrink-0">{avatar}</div>}
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-extrabold text-slate-900 truncate">{title}</h4>
        {badges}
      </div>
      {subtitle && <p className="text-sm text-slate-500 font-medium mt-0.5 truncate">{subtitle}</p>}
      {meta && <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-violet-600/80">{meta}</div>}
    </div>
    {actions && <div className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>{actions}</div>}
  </div>
);

export const IconBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning' }
> = ({ children, className = '', variant = 'default', ...props }) => {
  const v = {
    default: 'text-slate-400 hover:text-violet-600 hover:bg-violet-50',
    primary: 'text-white bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md shadow-violet-300',
    danger: 'text-white bg-gradient-to-br from-rose-500 to-pink-500 shadow-md shadow-rose-300',
    success: 'text-white bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md shadow-emerald-300',
    warning: 'text-white bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-300',
  }[variant];
  return (
    <button className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${v} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const TablePagination: React.FC<{
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}> = ({ pagination, onPageChange, onLimitChange, limitOptions = [5, 10, 20, 50] }) => {
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-violet-50 to-cyan-50 border-t-2 border-violet-100">
      <p className="text-xs font-bold text-violet-700">
        {start}–{end} of <span className="text-orange-500">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="vivid-input !py-1.5 !px-2 text-xs !w-auto">
            {limitOptions.map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
        )}
        <button type="button" disabled={!hasPrev} onClick={() => onPageChange(page - 1)} className="p-2 rounded-xl bg-white border-2 border-violet-100 disabled:opacity-30 hover:border-violet-300">
          <ChevronLeft size={16} className="text-violet-600" />
        </button>
        <span className="text-xs font-extrabold text-violet-700 min-w-[3rem] text-center">{page}/{totalPages}</span>
        <button type="button" disabled={!hasNext} onClick={() => onPageChange(page + 1)} className="p-2 rounded-xl bg-white border-2 border-violet-100 disabled:opacity-30 hover:border-violet-300">
          <ChevronRight size={16} className="text-violet-600" />
        </button>
      </div>
    </div>
  );
};

export const PageShell: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  accent?: 'blue' | 'indigo' | 'slate' | 'red';
}> = ({ title, subtitle, onBack, actions, children }) => (
  <div className="space-y-5 vivid-animate-in">
    <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white" style={{ background: 'linear-gradient(120deg, #7c3aed 0%, #2563eb 50%, #0891b2 100%)', boxShadow: '0 16px 48px -8px rgb(124 58 237 / 0.45)' }}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-20 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {onBack && (
            <button onClick={onBack} className="mt-1 p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-300" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>
            </div>
            {subtitle && <p className="text-white/85 font-medium text-sm md:text-base">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
    {children}
  </div>
);

export const VividStat: React.FC<{
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradIndex?: number;
  onClick?: () => void;
  trend?: string;
}> = ({ title, value, icon: Icon, gradIndex = 0, onClick, trend }) => (
  <div
    onClick={onClick}
    className={`vivid-stat ${onClick ? 'cursor-pointer' : ''}`}
    style={{ background: STAT_GRADS[gradIndex % STAT_GRADS.length] }}
  >
    <div className="relative z-10 flex items-end justify-between">
      <div>
        <p className="text-white/80 text-[10px] font-extrabold uppercase tracking-widest">{title}</p>
        <p className="text-4xl font-black mt-1 drop-shadow-sm">{value}</p>
        {trend && <p className="text-white/70 text-xs font-bold mt-1">{trend}</p>}
      </div>
      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
        <Icon size={26} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

export const StatCard = VividStat;

export const SectionCard: React.FC<{
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  color?: 'violet' | 'cyan' | 'orange';
}> = ({ title, subtitle, actions, children, noPadding, color = 'violet' }) => {
  const bar = { violet: 'from-violet-500 to-purple-500', cyan: 'from-cyan-500 to-blue-500', orange: 'from-orange-500 to-rose-500' }[color];
  return (
    <div className="vivid-card-solid overflow-hidden">
      {(title || actions) && (
        <div className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r ${bar} text-white`}>
          <div>
            {title && <h3 className="font-extrabold text-lg">{title}</h3>}
            {subtitle && <p className="text-white/80 text-xs font-semibold mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};

export const StatusBadge: React.FC<{ label: string; variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = ({
  label, variant = 'neutral',
}) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    warning: 'bg-amber-100 text-amber-800 border-amber-300',
    danger: 'bg-rose-100 text-rose-700 border-rose-300',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    neutral: 'bg-violet-100 text-violet-700 border-violet-200',
  }[variant];
  return <span className={`vivid-badge border-2 ${styles}`}>{label}</span>;
};

export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
}> = ({ value, onChange, placeholder = 'Search...', icon: Icon }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />}
    <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`vivid-input ${Icon ? 'pl-11' : ''}`} />
  </div>
);

export const EmptyState: React.FC<{ icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }> = ({
  icon: Icon, title, description, action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-5 rounded-3xl mb-4 text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
      <Icon size={36} />
    </div>
    <h4 className="font-extrabold text-violet-900 text-xl">{title}</h4>
    {description && <p className="text-slate-500 font-medium text-sm mt-2 max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const BtnPrimary: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'blue' | 'indigo' | 'slate' | 'danger' | 'success' }
> = ({ children, className = '', variant = 'blue', ...props }) => {
  const map = {
    blue: 'vivid-btn vivid-btn-cyan',
    indigo: 'vivid-btn vivid-btn-violet',
    slate: 'vivid-btn vivid-btn-violet',
    danger: 'vivid-btn vivid-btn-rose',
    success: 'vivid-btn vivid-btn-emerald',
  };
  return <button className={`${map[variant]} ${className}`} {...props}>{children}</button>;
};

export const BtnSecondary: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
  <button className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-violet-700 bg-white border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all ${className}`} {...props}>
    {children}
  </button>
);

export const PortalBanner: React.FC<{
  title: string;
  subtitle: string;
  variant?: 'traveler' | 'city' | 'super';
  logoUrl?: string;
}> = ({ title, subtitle, variant = 'traveler', logoUrl }) => {
  const grads = {
    traveler: 'linear-gradient(125deg, #0ea5e9 0%, #6366f1 45%, #a855f7 100%)',
    city: 'linear-gradient(125deg, #7c3aed 0%, #db2777 50%, #f97316 100%)',
    super: 'linear-gradient(125deg, #1e1b4b 0%, #7c3aed 40%, #0891b2 80%, #f59e0b 100%)',
  };
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white vivid-animate-in" style={{ background: grads[variant], boxShadow: '0 20px 50px -10px rgb(124 58 237 / 0.5)' }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="absolute -right-10 top-0 w-64 h-64 rounded-full bg-yellow-400/30 blur-3xl animate-[vivid-float_6s_ease-in-out_infinite]" />
      <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.3em] mb-3 bg-white/20 px-3 py-1 rounded-full">
            <Sparkles size={12} className="text-amber-300" /> Puntland Border Management
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">{title}</h2>
          <p className="text-white/90 mt-4 text-base md:text-lg font-medium leading-relaxed max-w-xl">{subtitle}</p>
        </div>
        <div className="p-4 md:p-5 rounded-3xl bg-white/15 backdrop-blur-md border-2 border-white/25 shrink-0" style={{ animation: 'vivid-float 5s ease-in-out infinite' }}>
          <LogoImage src={logoUrl} alt="Puntland BMS" className="h-14 md:h-20 w-auto object-contain drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};
