'use client';
import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, width = 'max-w-xl' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/50 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div className={`card w-full ${width} p-6 rise`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="font-display text-xl font-bold text-brand-deep">{title}</h2>
          <button type="button" onClick={onClose} className="text-ink-3 hover:text-ink text-xl leading-none" aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
