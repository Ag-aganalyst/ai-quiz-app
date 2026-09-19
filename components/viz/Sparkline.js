export default function Sparkline({ values = [], width = 140, height = 40, color = 'var(--brand)', accent = 'var(--accent-ink)' }) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / Math.max(1, values.length - 1)) * (width - 6) + 3,
    height - 4 - ((v - min) / span) * (height - 8),
  ]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill={accent} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
