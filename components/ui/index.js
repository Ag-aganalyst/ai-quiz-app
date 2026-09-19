'use client';
import Link from 'next/link';
import { useEffect } from 'react';

const btnVariants = {
  primary: 'bg-brand text-white hover:bg-brand-600 shadow-sm shadow-brand/30',
  accent: 'bg-accent text-brand-ink hover:brightness-95 shadow-sm',
  secondary: 'bg-white text-brand-deep border border-line hover:bg-brand-soft',
  ghost: 'text-brand-deep hover:bg-brand-soft',
  dark: 'bg-brand-deep text-white hover:bg-brand-700',
  danger: 'bg-critical text-white hover:brightness-95',
  light: 'bg-white/12 text-white border border-white/20 hover:bg-white/20',
};
const btnSizes = { sm: 'px-3 py-1.5 text-sm rounded-lg', md: 'px-4 py-2.5 text-sm rounded-xl', lg: 'px-6 py-3.5 text-base rounded-2xl' };

export function Button({ href, variant = 'primary', size = 'md', type = 'button', className = '', children, ...props }) {
  const cls = `inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${btnVariants[variant]} ${btnSizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}

export function Card({ className = '', pad = 'p-5', lift = false, children, ...props }) {
  return (
    <div className={`card ${pad} ${lift ? 'card-lift' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

const pillTones = {
  brand: 'bg-brand-soft text-brand-700 ring-brand-200',
  accent: 'bg-accent-soft text-accent-ink ring-accent/50',
  good: 'bg-[#e9f7e9] text-[#006300] ring-[#bfe6bf]',
  warn: 'bg-[#fff4d6] text-[#7a5200] ring-[#f7dc9a]',
  critical: 'bg-[#fdeaea] text-[#8f1f1f] ring-[#f2b8b8]',
  neutral: 'bg-page text-ink-2 ring-line',
  dark: 'bg-brand-deep text-white ring-brand-700',
};
export function Pill({ tone = 'brand', icon, className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${pillTones[tone]} ${className}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

export function StatTile({ label, value, delta, deltaGood = true, hint, className = '', children }) {
  return (
    <Card pad="p-4" className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{label}</span>
      <span className="font-display text-3xl font-bold text-brand-deep leading-none">{value}</span>
      {(delta || hint) && (
        <span className="text-xs text-ink-2 flex items-center gap-2">
          {delta && <span className={`font-semibold ${deltaGood ? 'text-[#006300]' : 'text-critical'}`}>{delta}</span>}
          {hint && <span>{hint}</span>}
        </span>
      )}
      {children}
    </Card>
  );
}

export function ProgressRing({ value = 0, size = 96, stroke = 9, track = 'var(--brand-100)', color = 'var(--brand)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset 600ms ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function StreakFlame({ size = 64, dim = false, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={`${dim ? '' : 'flame'} ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="flameOuter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef5a2a" />
        </linearGradient>
        <linearGradient id="flameInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff6c2" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <path d="M32 4c2 10 12 14 12 26 0 4-1 7-3 10 6-2 11-8 11-16 8 8 10 30-20 38C10 56 6 38 14 26c1 6 4 9 8 10-4-10 4-20 10-32z" fill={dim ? 'var(--line)' : 'url(#flameOuter)'} />
      <path d="M32 30c1 6 7 8 7 14 0 6-4 10-9 10s-9-4-9-10c0-4 2-6 4-8 0 3 2 5 4 5-2-4 1-8 3-11z" fill={dim ? '#fff' : 'url(#flameInner)'} />
    </svg>
  );
}

const avatarTones = ['bg-brand text-white', 'bg-brand-deep text-white', 'bg-accent text-brand-ink', 'bg-brand-200 text-brand-deep', 'bg-[#5b4bc4] text-white'];
export function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const tone = avatarTones[h % avatarTones.length];
  const sz = size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-10 w-10 text-sm';
  return <span className={`inline-flex items-center justify-center rounded-full font-bold ${sz} ${tone} ${className}`}>{initials || '?'}</span>;
}

export function SectionTitle({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-end justify-between gap-4 mb-3 ${className}`}>
      <div>
        <h2 className="font-display text-lg font-bold text-brand-deep">{title}</h2>
        {subtitle && <p className="text-sm text-ink-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start justify-between gap-4 py-2 cursor-pointer">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-2">{hint}</span>}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand' : 'bg-line'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </label>
  );
}

export function Field({ label, hint, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-semibold text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-3 mt-1">{hint}</span>}
    </label>
  );
}

export function Toast({ message, onDone, tone = 'dark' }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => onDone && onDone(), 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 rise">
      <div className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg ${tone === 'dark' ? 'bg-brand-deep text-white' : 'bg-accent text-brand-ink'}`}>{message}</div>
    </div>
  );
}

export function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${done ? 'bg-brand text-white ring-brand' : active ? 'bg-accent text-brand-ink ring-accent' : 'bg-white text-ink-3 ring-line'}`}>
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${done ? 'bg-white/25' : active ? 'bg-brand-ink/10' : 'bg-page'}`}>{done ? '✓' : i + 1}</span>
              {s}
            </span>
            {i < steps.length - 1 && <span className={`h-px w-3 sm:w-6 ${done ? 'bg-brand' : 'bg-line'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({ icon = '✨', title, body, action }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="text-4xl mb-2" aria-hidden="true">{icon}</div>
      <h3 className="font-display font-bold text-brand-deep">{title}</h3>
      {body && <p className="text-sm text-ink-2 mt-1 max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
