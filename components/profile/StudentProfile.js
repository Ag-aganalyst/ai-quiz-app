'use client';
import { useState } from 'react';
import ChallengeGrid from '@/components/viz/ChallengeGrid';
import Sparkline from '@/components/viz/Sparkline';
import SheetPlaceholder from '@/components/viz/SheetPlaceholder';
import { Avatar, Button, Card, Pill, SectionTitle, StatTile } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { fmtDate, fmtLong } from '@/lib/mock-data';

const STATUS = { verified: ['good', '✓ Verified'], submitted: ['brand', '◔ Submitted'], not_started: ['neutral', '○ Not started'], missed: ['critical', '✕ Missed'] };

/** Full student profile used by the admin and mentor consoles. `mentor` is the student's mentor record. */
export default function StudentProfile({ student: s, mentor, mentorPhoto = '', backHref, backLabel = 'Back', onToast, canTransfer = false }) {
  const { labels, challenge } = useSettings();
  const [note, setNote] = useState('');
  const [st, msg] = STATUS[s.status] || STATUS.not_started;
  const tests = [...s.tests].reverse();
  const toast = (m) => onToast && onToast(m);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button href={backHref} variant="ghost" size="sm">← {backLabel}</Button>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => toast(`Login reset. New code sent to ${s.email}.`)}>Reset login</Button>
          <Button size="sm" variant="secondary" onClick={() => toast(`Today excused for ${s.name.split(' ')[0]}. Streak preserved.`)}>Excuse today</Button>
          {canTransfer && <Button size="sm" variant="secondary" onClick={() => toast('Transfer started. Pick a batch with free seats.')}>Transfer batch</Button>}
        </div>
      </div>

      <Card className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
        <Avatar name={s.name} src={s.photo} size="xl" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-brand-deep">{s.name}</h1>
            <Pill tone={s.activation === 'Active' ? 'good' : 'warn'}>{s.activation}</Pill>
            <Pill tone={st}>{msg} today</Pill>
          </div>
          <p className="text-sm text-ink-2 mt-1">
            <span className="font-mono">{s.id}</span> · {s.batch} · {labels.mentor} <b className="text-ink">{mentor?.name}</b> · joined {fmtLong(s.joined)}
          </p>
          <p className="text-sm text-ink-2 mt-0.5">📞 {s.phone} · ✉️ {s.email} · {labels.parent}: <b className="text-ink">{s.parent?.name}</b> ({s.parent?.phone})</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-ink-2 mb-1"><span>{labels.challenge} progress</span><span><b className="text-ink">Day {s.day}</b> of {challenge.days}</span></div>
            <div className="h-2 rounded-full bg-brand-100 overflow-hidden"><div className="h-full bg-brand rounded-full" style={{ width: `${(s.day / challenge.days) * 100}%` }} /></div>
          </div>
        </div>
        <div className="flex md:flex-col items-center gap-3">
          <Avatar name={mentor?.name || ''} src={mentorPhoto || mentor?.photo} size="lg" />
          <div className="text-xs text-ink-2 text-center">{labels.mentor}<br /><b className="text-ink">{mentor?.name}</b></div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label={labels.streak} value={`${s.streak}d`} hint={`${s.missedLast5} missed in last 5`} />
        <StatTile label={labels.points} value={s.points.toLocaleString('en-IN')} />
        <StatTile label="Average test %" value={s.avgScore != null ? `${s.avgScore}%` : '—'} hint={`${s.tests.length} tests`} />
        <StatTile label="Last test" value={s.lastScore != null ? `${s.lastScore}%` : '—'} hint={tests[0] ? fmtDate(tests[0].date) : ''} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <Card>
          <SectionTitle title={`${challenge.days}-day ${labels.challenge.toLowerCase()}`} subtitle={`Day 1 was ${fmtLong(s.joined)}. Every 7th day is a revision day.`} />
          <ChallengeGrid total={challenge.days} day={s.day} missedDays={s.missedDays || []} revisionEvery={challenge.revisionEvery} />
        </Card>
        <Card>
          <SectionTitle title="Test history" subtitle="Newest first. Marks are what the mentor confirmed." action={tests.length > 1 && <Sparkline values={[...s.tests].slice(-10).map((t) => t.pct)} width={120} height={32} />} />
          <div className="max-h-80 overflow-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3 sticky top-0"><tr><th className="px-3 py-2">Test</th><th className="px-3 py-2">Date</th><th className="px-3 py-2 text-right">Marks</th><th className="px-3 py-2 text-right">%</th></tr></thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.day} className="border-t border-line">
                    <td className="px-3 py-2"><span className="text-ink-3 text-xs mr-1">Day {t.day}</span>{t.name}</td>
                    <td className="px-3 py-2 text-xs text-ink-2 whitespace-nowrap">{fmtDate(t.date, false)}</td>
                    <td className="px-3 py-2 text-right tabular">{t.marks}/{t.outOf}</td>
                    <td className="px-3 py-2 text-right tabular font-semibold">{t.pct}%</td>
                  </tr>
                ))}
                {!tests.length && <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-3">No tests yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="Recent uploads" subtitle="Answer sheets from the last three tasks" />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-line aspect-[3/4] bg-page"><SheetPlaceholder seed={s.day + i} /></div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="Private notes" subtitle={`Visible to the ${labels.mentor.toLowerCase()} and ${labels.admin.toLowerCase()} only`} />
          <textarea className="input text-sm" rows={5} placeholder="e.g. Struggles with numericals, parents asked for a call on Sundays." value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="mt-2 flex justify-end"><Button size="sm" onClick={() => toast('Note saved.')}>Save note</Button></div>
        </Card>
      </div>
    </div>
  );
}
