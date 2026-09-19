'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import SheetPlaceholder from '@/components/viz/SheetPlaceholder';
import { Avatar, Button, Card, EmptyState, Pill, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { MENTOR, VERIFY_QUEUE } from '@/lib/mock-data';

const CHIPS = ['Good work', 'Show steps', 'Redo Q3', 'Neater handwriting', 'Label diagrams'];

export default function VerifyPage() {
  const { labels, points: P, features } = useSettings();
  const [queue, setQueue] = useState(VERIFY_QUEUE);
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState('');
  const [chips, setChips] = useState([]);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(0);
  const [toast, setToast] = useState('');
  const item = queue[idx];

  function finish(kind) {
    if (!item) return;
    setQueue((q) => q.filter((v) => v.id !== item.id));
    setIdx(0);
    setMarks('');
    setChips([]);
    setNote('');
    setDone((d) => d + 1);
    setToast(kind === 'tick' ? `Ticked ${item.student.name.split(' ')[0]}. +${P.verified} ${labels.points} released.` : `Sent back to ${item.student.name.split(' ')[0]} with your note.`);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'v' || e.key === 'V') finish('tick');
      if (e.key === 's' || e.key === 'S') finish('back');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">Verification inbox</h1>
          <p className="text-sm text-ink-2">{queue.length} waiting · {done} done this session · target: 50 in under 15 minutes</p>
        </div>
        <div className="w-56 h-2 rounded-full bg-brand-100 overflow-hidden"><div className="h-full bg-brand rounded-full transition-all" style={{ width: `${(done / (done + queue.length || 1)) * 100}%` }} /></div>
      </div>

      {!item ? (
        <Card><EmptyState icon="🎉" title="Inbox clear" body={`Every upload is ticked. Your ${labels.mentor.toLowerCase()} streak is safe for today.`} action={<Button href="/mentor">Back to dashboard</Button>} /></Card>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr_320px] gap-4">
          <Card pad="p-2" className="order-2 lg:order-1 max-h-[70vh] overflow-auto">
            <ul className="space-y-1">
              {queue.map((v, i) => (
                <li key={v.id}>
                  <button type="button" onClick={() => setIdx(i)} className={`w-full text-left flex items-center gap-2 rounded-xl px-2 py-2 ${i === idx ? 'bg-brand-soft ring-1 ring-brand-200' : 'hover:bg-page'}`}>
                    <Avatar name={v.student.name} size="sm" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold truncate">{v.student.name}</span>
                      <span className="block text-[11px] text-ink-3">{v.submittedAt} · {v.pages}p{v.aiFlag ? ' · ⚠️' : ''}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card pad="p-3" className="order-1 lg:order-2">
            <div className="flex items-center justify-between px-1 pb-2">
              <div className="text-sm"><b>{item.student.name}</b> <span className="text-ink-3 font-mono text-xs">{item.student.id}</span></div>
              <div className="text-xs text-ink-2">Page 1 of {item.pages} · {item.minutes} min on task</div>
            </div>
            <div className="rounded-xl overflow-hidden bg-page border border-line aspect-[3/4] max-h-[60vh] mx-auto">
              <SheetPlaceholder seed={idx + 3} />
            </div>
            {item.aiFlag && features.aiVerify && (
              <div className="mt-2 rounded-xl bg-[#fff4d6] border border-[#f7dc9a] px-3 py-2 text-xs text-[#7a5200]">⚠️ AI pre-check: {item.aiFlag}. Look closer before ticking.</div>
            )}
          </Card>

          <Card className="order-3 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Marks</div>
              <div className="mt-1.5 flex items-center gap-2">
                <input className="input w-24 text-center font-display text-lg" placeholder={String(item.selfMarks)} value={marks} onChange={(e) => setMarks(e.target.value.replace(/\D/g, ''))} />
                <span className="text-ink-2">/ {item.outOf}</span>
                <Pill tone="neutral">self-marked {item.selfMarks}</Pill>
              </div>
              <p className="text-[11px] text-ink-3 mt-1">Leave blank to accept the student&apos;s own marks.</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Feedback</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {CHIPS.map((c) => (
                  <button key={c} type="button" onClick={() => setChips((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]))} className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition ${chips.includes(c) ? 'bg-brand text-white ring-brand' : 'bg-white text-ink-2 ring-line hover:ring-brand-200'}`}>{c}</button>
                ))}
              </div>
              <textarea className="input mt-2 text-sm" rows={2} placeholder="Optional note, or hold 🎤 for a 10-second voice note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Button size="lg" onClick={() => finish('tick')}>✓ Tick <kbd className="ml-1 rounded bg-white/20 px-1 text-[10px]">V</kbd></Button>
              <Button size="lg" variant="secondary" onClick={() => finish('back')}>↩ Send back <kbd className="ml-1 rounded bg-page px-1 text-[10px]">S</kbd></Button>
            </div>
            <p className="text-[11px] text-ink-3">Send back requires a reason and reopens the task until the deadline.</p>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
