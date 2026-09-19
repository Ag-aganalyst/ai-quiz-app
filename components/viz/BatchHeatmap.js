'use client';
import { useState } from 'react';

export const STATUS = {
  verified: { label: 'Verified', icon: '✓', color: 'var(--good)', text: '#fff' },
  submitted: { label: 'Submitted', icon: '◔', color: 'var(--brand)', text: '#fff' },
  not_started: { label: 'Not started', icon: '○', color: 'var(--line)', text: 'var(--ink-2)' },
  missed: { label: 'Missed', icon: '✕', color: 'var(--critical)', text: '#fff' },
};

/** 50 tiles, one per student, coloured by today's status. Status carries icon + label, never colour alone. */
export default function BatchHeatmap({ students, onSelect }) {
  const [hover, setHover] = useState(null);
  const counts = students.reduce((acc, s) => ({ ...acc, [s.status]: (acc[s.status] || 0) + 1 }), {});
  return (
    <div>
      <div className="relative">
        <div className="grid grid-cols-10 gap-1.5">
          {students.map((s) => {
            const st = STATUS[s.status] || STATUS.not_started;
            return (
              <button
                key={s.id}
                type="button"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s)}
                onBlur={() => setHover(null)}
                onClick={() => onSelect && onSelect(s)}
                className="aspect-square rounded-md text-[10px] font-bold flex items-center justify-center transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-deep"
                style={{ background: st.color, color: st.text }}
                aria-label={`${s.name}: ${st.label}`}
              >
                {st.icon}
              </button>
            );
          })}
        </div>
        {hover && (
          <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-lg bg-brand-deep text-white text-xs px-3 py-1.5 shadow-lg whitespace-nowrap">
            <span className="font-semibold">{hover.name}</span> · {STATUS[hover.status].label}
            {hover.streak != null && <span className="text-white/70"> · {hover.streak}-day streak</span>}
          </div>
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {Object.entries(STATUS).map(([k, st]) => (
          <li key={k} className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold" style={{ background: st.color, color: st.text }}>{st.icon}</span>
            {st.label} <span className="tabular font-semibold text-ink">{counts[k] || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
