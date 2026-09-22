'use client';
import { useMemo, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import { Button, Card, Field, Pill, SectionTitle, StatTile, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { ALL_STUDENTS, CHALLENGE_PLAN, TASK_TYPES, dayGroups } from '@/lib/mock-data';

const TYPE_KEYS = Object.keys(TASK_TYPES);

export default function TaskPlanPage() {
  const { labels, brand, challenge } = useSettings();
  const [plan, setPlan] = useState(CHALLENGE_PLAN);
  const [week, setWeek] = useState(5);
  const [toast, setToast] = useState('');
  const [extra, setExtra] = useState({ title: '', note: '' });
  const weeks = Math.ceil(challenge.days / 7);
  const counts = useMemo(() => Object.fromEntries(dayGroups(ALL_STUDENTS).map((g) => [g.day, g.count])), []);
  const rows = plan.slice((week - 1) * 7, week * 7);
  const missing = plan.filter((p) => p.type === 'test' && !p.material).length;
  const filled = plan.filter((p) => p.title.trim()).length;

  const edit = (day, patch) => setPlan((p) => p.map((r) => (r.day === day ? { ...r, ...patch } : r)));
  const duplicate = (day) => {
    const src = plan[day - 1];
    if (day >= plan.length) return;
    edit(day + 1, { title: src.title, subject: src.subject, type: src.type, durationMin: src.durationMin, points: src.points, material: src.material });
    setToast(`Day ${day} copied to Day ${day + 1}.`);
  };

  return (
    <AppShell role="admin" user={{ name: labels.admin, sub: brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">The {challenge.days}-day {labels.challenge.toLowerCase()} plan</h1>
          <p className="text-sm text-ink-2">Every student walks Day 1 to Day {challenge.days} from their own joining date. Edit any future day; students already past it are unaffected. Every {challenge.revisionEvery}th day is a lighter revision day.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setToast('Plan exported as CSV.')}>⬇ Export CSV</Button>
          <label className="inline-flex"><input type="file" accept=".csv,.xlsx" className="hidden" onChange={() => setToast('Sheet parsed. 90 rows updated, 0 errors.')} /><span className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep hover:bg-brand-soft cursor-pointer">⬆ Import CSV</span></label>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatTile label="Days planned" value={`${filled}/${challenge.days}`} hint="titles filled in" />
        <StatTile label="Papers missing" value={missing} hint="test days without a PDF" deltaGood={false} />
        <StatTile label="Busiest day today" value={`Day ${dayGroups(ALL_STUDENTS)[0]?.day}`} hint={`${dayGroups(ALL_STUDENTS)[0]?.count} students on it`} />
        <StatTile label="Tomorrow" value={`Day ${(dayGroups(ALL_STUDENTS)[0]?.day || 0) + 1}`} hint={plan[dayGroups(ALL_STUDENTS)[0]?.day]?.title || ''} />
      </div>

      <Card pad="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
              <button key={w} type="button" onClick={() => setWeek(w)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${week === w ? 'bg-brand text-white ring-brand' : 'bg-white text-ink-2 ring-line hover:ring-brand-200'}`}>Week {w}</button>
            ))}
          </div>
          <span className="text-xs text-ink-3">Days {(week - 1) * 7 + 1} to {Math.min(challenge.days, week * 7)} · students on a day are shown so you know who is affected</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
              <tr><th className="px-3 py-2">Day</th><th className="px-3 py-2">Type</th><th className="px-3 py-2 min-w-[260px]">Title</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Min</th><th className="px-3 py-2">Pts</th><th className="px-3 py-2">Paper</th><th className="px-3 py-2 text-right">Students</th><th className="px-3 py-2"></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.day} className={`border-t border-line ${r.type === 'revision' ? 'bg-brand-soft/40' : ''}`}>
                  <td className="px-3 py-2 font-display font-bold text-brand-deep whitespace-nowrap">Day {r.day}{r.day % 7 === 0 && <span className="ml-1 text-[10px] text-ink-3 font-sans">↻</span>}</td>
                  <td className="px-3 py-2">
                    <select className="input py-1.5 text-xs w-36" value={r.type} onChange={(e) => edit(r.day, { type: e.target.value })}>
                      {TYPE_KEYS.map((t) => <option key={t} value={t}>{TASK_TYPES[t].icon} {TASK_TYPES[t].label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2"><input className="input py-1.5 text-sm" value={r.title} onChange={(e) => edit(r.day, { title: e.target.value })} /></td>
                  <td className="px-3 py-2"><input className="input py-1.5 text-xs w-28" value={r.subject} onChange={(e) => edit(r.day, { subject: e.target.value })} /></td>
                  <td className="px-3 py-2"><input className="input py-1.5 text-xs w-16 tabular" type="number" value={r.durationMin} onChange={(e) => edit(r.day, { durationMin: Number(e.target.value) })} /></td>
                  <td className="px-3 py-2"><input className="input py-1.5 text-xs w-16 tabular" type="number" value={r.points} onChange={(e) => edit(r.day, { points: Number(e.target.value) })} /></td>
                  <td className="px-3 py-2">
                    {r.type === 'test' ? (
                      r.material ? <Pill tone="good">📎 attached</Pill> : <label className="inline-flex"><input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { edit(r.day, { material: e.target.files?.[0]?.name || 'paper.pdf' }); setToast(`Paper attached to Day ${r.day}.`); }} /><span className="cursor-pointer"><Pill tone="warn">Attach PDF</Pill></span></label>
                    ) : <span className="text-xs text-ink-3">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular">{counts[r.day] ? <Pill tone="brand">{counts[r.day]} today</Pill> : <span className="text-ink-3">0</span>}</td>
                  <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" onClick={() => duplicate(r.day)} title="Copy to the next day">⧉</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-line flex justify-end"><Button onClick={() => setToast('Plan saved. Mentors see the updated tomorrow preview at 9 PM.')}>Save plan</Button></div>
      </Card>

      <Card className="mt-4">
        <SectionTitle title="Push an extra task or announcement today" subtitle="Goes to every student regardless of their day, without changing the plan" />
        <form className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end" onSubmit={(e) => { e.preventDefault(); setToast(`"${extra.title || 'Extra task'}" sent to ${ALL_STUDENTS.length} students.`); setExtra({ title: '', note: '' }); }}>
          <Field label="Title"><input className="input" placeholder="e.g. NEET mock test this Sunday, 9 AM" value={extra.title} onChange={(e) => setExtra({ ...extra, title: e.target.value })} /></Field>
          <Field label="Message"><input className="input" placeholder="What to do and by when" value={extra.note} onChange={(e) => setExtra({ ...extra, note: e.target.value })} /></Field>
          <Button type="submit" size="lg">Send to all</Button>
        </form>
      </Card>
    </AppShell>
  );
}
