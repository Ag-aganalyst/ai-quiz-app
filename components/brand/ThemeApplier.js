'use client';
import { useEffect } from 'react';
import { useSettings } from '@/lib/settings-store';
import { derivePalette } from '@/lib/color';

/** Pushes the owner's brand colours into CSS variables so every page re-themes live. */
export default function ThemeApplier() {
  const { brand } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    const vars = derivePalette(brand);
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('--radius', `${Number(brand.radius) || 18}px`);
    document.title = brand.appName || 'Brainy Media';
  }, [brand]);
  return null;
}
