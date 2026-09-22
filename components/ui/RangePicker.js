'use client';
import { ANCHOR, addDays, isoDate } from '@/lib/mock-data';

export const PRESETS = [7, 15, 30, 90];

/** Shared date-range control: preset "last N days" chips plus a custom from/to. `value` = { preset, from, to }. */
export function rangeFor(preset, today = ANCHOR) {
  return { preset, from: addDays(today, -(preset - 1)), to: today };
}

export default function RangePicker({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button key={p} type="button" onClick={() => onChange(rangeFor(p))} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${value.preset === p ? 'bg-brand text-white ring-brand' : 'bg-white text-ink-2 ring-line hover:ring-brand-200'}`}>
          Last {p} days
        </button>
      ))}
      <span className="text-xs text-ink-3">or</span>
      <input type="date" className="input w-auto py-1.5 text-xs" value={isoDate(value.from)} max={isoDate(value.to)} onChange={(e) => e.target.value && set({ preset: null, from: new Date(`${e.target.value}T00:00:00`) })} aria-label="From date" />
      <span className="text-xs text-ink-3">to</span>
      <input type="date" className="input w-auto py-1.5 text-xs" value={isoDate(value.to)} min={isoDate(value.from)} max={isoDate(ANCHOR)} onChange={(e) => e.target.value && set({ preset: null, to: new Date(`${e.target.value}T00:00:00`) })} aria-label="To date" />
    </div>
  );
}
