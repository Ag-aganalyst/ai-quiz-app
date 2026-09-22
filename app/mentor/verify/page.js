'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import SheetPlaceholder from '@/components/viz/SheetPlaceholder';
import { Avatar, Button, Card, EmptyState, Pill, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { MENTOR, TEST_ANALYSIS_QUEUE, VERIFY_QUEUE } from '@/lib/mock-data';

const CHIPS = ['Good work', 'Show steps', 'Redo Q3', 'Neater handwriting', 'Label diagrams'];

function DailyTab({ onToast }) {
  const { labels, points: P, features } = useSettings();
  const [queue, setQueue] = useState(VERIFY_QUEUE);
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState('');
  const [chips, setChips] = useState([]);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(0);
  const item = queue[idx];

  function finish(kind) {
    if (!item) return;
    setQueue((q) => q.filter((v) => v.id !== item.id));
    setIdx(0);
    setMarks('');
    setChips([]);
    setNote('');
    setDone((d) => d + 1);
    onToast(kind === 'tick' ? `Ticked ${item.student.name.split(' ')[0]}. +${P.verified} ${labels.points} released.` : `Sent back to ${item.student.name.split(' ')[0]} with your note.`);
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

  if (!item) return <Card><EmptyState icon="🎉" title="Daily tasks clear" body={`Every upload is ticked. ${done} done this session.`} action={<Button href="/mentor">Back to dashboard</Button>} /></Card>;

  return (
    <div className="grid lg:grid-cols-[280px_1fr_320px] gap-4">
      <Card pad="p-2" className="order-2 lg:order-1 max-h-[70vh] overflow-auto">
        <ul className="space-y-1">
          {queue.map((v, i) => (
            <li key={v.id}>
              <button type="button" onClick={() => setIdx(i)} className={`w-full text-left flex items-center gap-2 rounded-xl px-2 py-2 ${i === idx ? 'bg-brand-soft ring-1 ring-brand-200' : 'hover:bg-page'}`}>
                <Avatar name={v.student.name} size="sm" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">{v.student.name}</span>
                  <span className="block text-[11px] text-ink-3 truncate">Day {v.student.day} · {v.submittedAt} · {v.pages}p{v.aiFlag ? ' · ⚠️' : ''}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card pad="p-3" className="order-1 lg:order-2">
        <div className="flex items-center justify-between px-1 pb-2">
          <div className="text-sm"><b>{item.student.name}</b> <span className="text-ink-3 font-mono text-xs">{item.student.id}</span></div>
          <div className="text-xs text-ink-2">Day {item.student.day} · {item.task.title}</div>
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
  );
}

function AnalysisTab({ onToast }) {
  const { labels } = useSettings();
  const [queue, setQueue] = useState(TEST_ANALYSIS_QUEUE);
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState('');
  const item = queue[idx];

  function confirm() {
    if (!item) return;
    const final = marks ? Number(marks) : item.selfMarks;
    setQueue((q) => q.filter((v) => v.id !== item.id));
    setIdx(0);
    setMarks('');
    onToast(`${item.student.name.split(' ')[0]}: ${final}/${item.outOf} confirmed. Parent portal and average updated.`);
  }

  if (!item) return <Card><EmptyState icon="📈" title="Test analyses clear" body="Every test mark is confirmed. Parents and averages are up to date." action={<Button href="/mentor">Back to dashboard</Button>} /></Card>;
  const pct = Math.round(((marks ? Number(marks) : item.selfMarks) / item.outOf) * 100);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      <Card pad="p-2" className="max-h-[70vh] overflow-auto">
        <ul className="space-y-1">
          {queue.map((v, i) => (
            <li key={v.id}>
              <button type="button" onClick={() => setIdx(i)} className={`w-full text-left flex items-center gap-2 rounded-xl px-2 py-2 ${i === idx ? 'bg-brand-soft ring-1 ring-brand-200' : 'hover:bg-page'}`}>
                <Avatar name={v.student.name} size="sm" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">{v.student.name}</span>
                  <span className="block text-[11px] text-ink-3 truncate">Day {v.student.day} · self {v.selfMarks}/{v.outOf} · {v.submittedAt}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Day {item.student.day} · {item.task.subject}</div>
              <h2 className="font-display text-xl font-bold text-brand-deep">{item.task.title.replace(/^(Test|Quick test): /, '')}</h2>
              <p className="text-sm text-ink-2"><b>{item.student.name}</b> <span className="font-mono text-xs text-ink-3">{item.student.id}</span> · submitted {item.submittedAt}</p>
            </div>
            <Pill tone="neutral">Self-marked {item.selfMarks}/{item.outOf}</Pill>
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-page p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">System analysis</div><div className="font-display text-2xl font-bold text-brand-deep">{item.systemPct}%</div><div className="text-xs text-ink-2">from the in-app answers</div></div>
            <div className="rounded-xl bg-page p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Weak topics</div><div className="mt-1 flex flex-wrap gap-1">{item.weak.map((w) => <Pill key={w} tone="warn">{w}</Pill>)}</div></div>
            <div className="rounded-xl bg-page p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Batch average</div><div className="font-display text-2xl font-bold text-brand-deep">61%</div><div className="text-xs text-ink-2">same test, {labels.batch} A</div></div>
          </div>
        </Card>
        <div className="grid md:grid-cols-[1fr_300px] gap-4">
          <Card pad="p-3"><div className="rounded-xl overflow-hidden bg-page border border-line aspect-[3/4] max-h-[50vh] mx-auto"><SheetPlaceholder seed={idx + 11} /></div></Card>
          <Card className="space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Confirm marks</div>
              <div className="mt-1.5 flex items-center gap-2">
                <input className="input w-24 text-center font-display text-lg" placeholder={String(item.selfMarks)} value={marks} onChange={(e) => setMarks(e.target.value.replace(/\D/g, ''))} />
                <span className="text-ink-2">/ {item.outOf}</span>
                <Pill tone="brand">{pct}%</Pill>
              </div>
              <p className="text-[11px] text-ink-3 mt-1">Blank keeps the self-marked score. What you confirm is what the {labels.parent.toLowerCase()} portal and the average use.</p>
            </div>
            <Button size="lg" className="w-full" onClick={confirm}>{marks && Number(marks) !== item.selfMarks ? 'Correct & confirm' : 'Confirm marks'}</Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={() => onToast(`Asked ${item.student.name.split(' ')[0]} to re-upload page 2.`)}>Ask to re-upload</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const profile = useMentorProfile();
  const [tab, setTab] = useState('daily');
  const [toast, setToast] = useState('');
  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch, photo: profile.photo }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">Verification inbox</h1>
          <p className="text-sm text-ink-2">Two queues, one place. Target: 50 in under 15 minutes.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-white border border-line p-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'daily'} onClick={() => setTab('daily')} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === 'daily' ? 'bg-brand text-white' : 'text-ink-2 hover:bg-page'}`}>Daily tasks · {VERIFY_QUEUE.length}</button>
          <button type="button" role="tab" aria-selected={tab === 'analysis'} onClick={() => setTab('analysis')} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === 'analysis' ? 'bg-brand text-white' : 'text-ink-2 hover:bg-page'}`}>Test analysis · {TEST_ANALYSIS_QUEUE.length}</button>
        </div>
      </div>
      {tab === 'daily' ? <DailyTab onToast={setToast} /> : <AnalysisTab onToast={setToast} />}
    </AppShell>
  );
}
