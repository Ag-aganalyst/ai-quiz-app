'use client';

/** The three tabs every portal shares above the chat: Announcements, Chat, Study room. */
export default function CommunityTabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 rounded-full bg-white border border-line p-1 overflow-x-auto" role="tablist">
      {tabs.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${value === t.key ? 'bg-brand text-white' : 'text-ink-2 hover:bg-page'}`}>
          {t.icon} {t.label}{t.count ? ` · ${t.count}` : ''}
        </button>
      ))}
    </div>
  );
}
