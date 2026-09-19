// Small colour helpers used to derive a full palette from the admin's brand colours.

export function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return { r: 42, g: 141, b: 120 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix `hex` toward `toward` by `t` (0..1). */
export function mix(hex, toward, t) {
  const a = hexToRgb(hex);
  const b = hexToRgb(toward);
  return rgbToHex({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
}

export function isValidHex(hex) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((hex || '').trim());
}

/** Derive every CSS variable the UI uses from three admin-chosen colours. */
export function derivePalette({ primary, primaryDeep, accent }) {
  const p = isValidHex(primary) ? primary : '#2a8d78';
  const d = isValidHex(primaryDeep) ? primaryDeep : '#0f3d34';
  const a = isValidHex(accent) ? accent : '#f5d020';
  return {
    '--brand': p,
    '--brand-600': mix(p, '#000000', 0.12),
    '--brand-700': mix(p, '#000000', 0.28),
    '--brand-deep': d,
    '--brand-ink': mix(d, '#000000', 0.3),
    '--brand-100': mix(p, '#ffffff', 0.78),
    '--brand-200': mix(p, '#ffffff', 0.62),
    '--brand-soft': mix(p, '#ffffff', 0.9),
    '--accent': a,
    '--accent-ink': mix(a, '#000000', 0.58),
    '--accent-soft': mix(a, '#ffffff', 0.8),
    '--page': mix(p, '#ffffff', 0.955),
    '--line': mix(p, '#ffffff', 0.84),
  };
}
