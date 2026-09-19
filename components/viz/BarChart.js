'use client';
import { useState } from 'react';

/** Single-series bar chart: thin rounded marks, recessive grid, hover tooltip, direct label on the peak. */
export default function BarChart({ data, height = 160, color = 'var(--brand)', valueSuffix = '' }) {
  const [hover, setHover] = useState(null);
  const w = 100;
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
  const gap = 2;
  const bw = (w - gap * (data.length - 1)) / data.length;
  const plotH = height;
  return (
    <div>
      <div className="flex justify-end text-xs text-ink-2 mb-1 h-6 items-center">
        {hover ? (
          <span className="rounded-md bg-brand-deep text-white px-2 py-1 shadow">{hover.label}: <b>{hover.value}{valueSuffix}</b></span>
        ) : (
          <span>Peak <b className="text-ink">{peak.label}</b> · {peak.value}{valueSuffix}</span>
        )}
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img" aria-label="Score distribution">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={w} y1={plotH * (1 - g)} y2={plotH * (1 - g)} stroke="var(--line)" strokeWidth="0.3" />
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * plotH;
          const x = i * (bw + gap);
          return (
            <g key={d.label} onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)}>
              <rect x={x} y={0} width={bw} height={plotH} fill="transparent" />
              <rect x={x} y={plotH - h} width={bw} height={h} rx="1.2" fill={hover && hover !== d ? 'var(--brand-200)' : color} style={{ transition: 'fill 150ms' }} />
            </g>
          );
        })}
        <line x1="0" x2={w} y1={plotH} y2={plotH} stroke="var(--ink-3)" strokeWidth="0.4" />
      </svg>
      <div className="flex text-[11px] text-ink-3 mt-1" style={{ gap }}>
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center truncate">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
