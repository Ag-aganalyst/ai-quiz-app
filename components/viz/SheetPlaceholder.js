/** A stand-in for an uploaded answer-sheet photo: a lined page with pseudo-handwriting. */
export default function SheetPlaceholder({ seed = 1, label = 'Answer sheet', className = '' }) {
  const rnd = (i) => ((Math.sin(seed * 97 + i * 13) + 1) / 2);
  const lines = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg viewBox="0 0 220 300" className={`w-full h-full ${className}`} role="img" aria-label={label}>
      <rect x="4" y="4" width="212" height="292" rx="8" fill="#fffdf6" stroke="#e6dfc8" />
      <rect x="4" y="4" width="212" height="292" rx="8" fill="url(#shade)" opacity="0.5" />
      <defs>
        <linearGradient id="shade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#f1ead6" />
        </linearGradient>
      </defs>
      <line x1="30" x2="30" y1="14" y2="288" stroke="#f0b7b7" strokeWidth="1" />
      {lines.map((i) => {
        const y = 30 + i * 18;
        const w = 60 + rnd(i) * 110;
        return (
          <g key={i}>
            <line x1="12" x2="208" y1={y} y2={y} stroke="#dbe7ee" strokeWidth="1" />
            <path d={`M38 ${y - 4} q6 -6 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0`} fill="none" stroke="#2b3a8f" strokeWidth="1.6" strokeLinecap="round" strokeDasharray={`${w} 400`} opacity="0.85" />
          </g>
        );
      })}
      <circle cx="184" cy="48" r="14" fill="none" stroke="#c53a3a" strokeWidth="2" />
      <text x="184" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill="#c53a3a">✓</text>
    </svg>
  );
}
