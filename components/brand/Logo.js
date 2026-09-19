'use client';
import Link from 'next/link';
import { useSettings } from '@/lib/settings-store';

/**
 * The BMN logo sits on a white chip so it reads on both light cards and the deep-teal header.
 * `wordmark` adds the app name next to it.
 */
export default function Logo({ href = '/', size = 'md', wordmark = false, light = false }) {
  const { brand } = useSettings();
  const h = size === 'lg' ? 'h-14' : size === 'sm' ? 'h-7' : 'h-9';
  const pad = size === 'lg' ? 'px-4 py-2' : 'px-2.5 py-1.5';
  return (
    <Link href={href} className="inline-flex items-center gap-3 group" aria-label={brand.appName}>
      <span className={`inline-flex items-center rounded-xl bg-white ${pad} shadow-sm ring-1 ring-black/5`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logoUrl} alt={brand.appName} className={`${h} w-auto object-contain`} />
      </span>
      {wordmark && (
        <span className="leading-tight">
          <span className={`block font-display font-bold ${size === 'lg' ? 'text-2xl' : 'text-lg'} ${light ? 'text-white' : 'text-brand-deep'}`}>
            {brand.appName}
          </span>
          <span className={`block text-xs ${light ? 'text-white/70' : 'text-ink-3'}`}>{brand.tagline}</span>
        </span>
      )}
    </Link>
  );
}
