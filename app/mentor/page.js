'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import BatchHeatmap from '@/components/viz/BatchHeatmap';
import BarChart from '@/components/viz/BarChart';
import SheetPlaceholder from '@/components/viz/SheetPlaceholder';
import { Avatar, Button, Card, Pill, SectionTitle, StatTile, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { AT_RISK, HARD_QUESTIONS, MENTOR, SCORE_BUCKETS, STUDENTS, TODAY_TASK, VERIFY_QUEUE } from '@/lib/mock-data';

export default function MentorDashboard() {
  const { labels, schedule } = useSettings();
  const [queue, setQueue] = useState(VERIFY_QUEUE.slice(0, 3));
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);
  const submitted = STUDENTS.filter((s) => s.status === 'submitted' || s.status === 'verified').length;
  const verified = STUDENTS.filter((s) => s.status === 'verified').length;
  const notYet = STUDENTS.filter((s) => s.status === 'not_started').length;
  const avgStreak = Math.round(STUDENTS.reduce((a, s) => a + s.streak, 0) / STUDENTS.length);

  function act(id, what) {
    setQueue((q) => q.filter((v) => v.id !== id));
    setToast(what === 'tick' ? 'Ticked. Student notified, points released.' : 'Sent back with a note. Task reopened.');
  }

  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: `${MENTOR.batch} · ${STUDENTS.length}/${schedule.seatsPerMentor} seats` }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 rise">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-deep">{MENTOR.batch} · {MENTOR.batchNick}</h1>
          <p className="text-sm text-ink-2">Saturday, 19 September · 🔥 {MENTOR.streak}-day {labels.mentor.toLowerCase()} streak (assign daily, verify within 24h)</p>
        </div>
        <div className="flex gap-2">
          <Button href="/mentor/students" variant="secondary">＋ Add {labels.student.toLowerCase()}s</Button>
          <Button href="/mentor/assign">Assign tomorrow&apos;s {labels.task.toLowerCase()}</Button>
        </div>
      </div>

      <Card className="rise-2 bg-brand-gradient text-white border-0" pad="p-5">
        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="accent" icon="🎯">Today</Pill>
              <span className="text-xs text-white/70">published 8:40 AM · closes {schedule.deadline}</span>
            </div>
            <h2 className="mt-2 font-display text-xl font-bold">{TODAY_TASK.title}</h2>
            <p className="text-sm text-white/80">{TODAY_TASK.subject} · {TODAY_TASK.typeLabel} · {TODAY_TASK.durationMin} min</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/10 px-4 py-2"><div className="font-display text-2xl font-extrabold">{submitted}<span className="text-sm text-white/60">/{STUDENTS.length}</span></div><div className="text-[11px] text-white/70">submitted</div></div>
            <div className="rounded-xl bg-white/10 px-4 py-2"><div className="font-display text-2xl font-extrabold">{VERIFY_QUEUE.length}</div><div className="text-[11px] text-white/70">to verify</div></div>
            <div className="rounded-xl bg-white/10 px-4 py-2"><div className="font-display text-2xl font-extrabold">{notYet}</div><div className="text-[11px] text-white/70">not started</div></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button href="/mentor/verify" variant="accent" size="sm">Open verification inbox ({VERIFY_QUEUE.length})</Button>
          <Button variant="light" size="sm" onClick={() => setToast(`Reminder sent to ${notYet} students on WhatsApp and email.`)}>Remind {notYet} who haven&apos;t started</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 rise-3">
        <StatTile label="Completion today" value={`${Math.round((submitted / STUDENTS.length) * 100)}%`} delta="+6" hint="vs. yesterday" />
        <StatTile label="Verified so far" value={verified} hint={`avg turnaround 6h`} />
        <StatTile label={`${labels.batch} avg score`} value="71%" delta="+3" hint="7-day trend" />
        <StatTile label={`Avg ${labels.streak.toLowerCase()}`} value={`${avgStreak}d`} hint={`${STUDENTS.filter((s) => s.streak >= 7).length} on 7+ days`} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 mt-4 rise-4">
        <Card>
          <SectionTitle title={`${labels.batch} heatmap`} subtitle="One tile per student. Tap a tile for details." action={selected && <Pill tone="brand">{selected.name}</Pill>} />
          <BatchHeatmap students={STUDENTS} onSelect={setSelected} />
          {selected && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-page p-3 text-sm">
              <Avatar name={selected.name} />
              <div className="flex-1">
                <div className="font-semibold">{selected.name} <span className="text-ink-3 font-mono text-xs">{selected.id}</span></div>
                <div className="text-xs text-ink-2">🔥 {selected.streak} days · avg {selected.avgScore}% · {selected.points.toLocaleString('en-IN')} {labels.points}</div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setToast(`Nudge sent to ${selected.name.split(' ')[0]}.`)}>Nudge</Button>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="Verification inbox" subtitle="Newest first · V to tick, S to send back" action={<Button href="/mentor/verify" size="sm" variant="ghost">All →</Button>} />
            {queue.length === 0 ? (
              <div className="rounded-xl bg-brand-soft p-4 text-sm text-brand-700 text-center">Inbox clear. 🎉</div>
            ) : (
              <ul className="space-y-2">
                {queue.map((v, i) => (
                  <li key={v.id} className="flex items-center gap-3 rounded-xl border border-line p-2">
                    <div className="h-14 w-11 rounded-md overflow-hidden bg-page shrink-0"><SheetPlaceholder seed={i + 1} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{v.student.name}</div>
                      <div className="text-xs text-ink-2">{v.pages} page{v.pages > 1 ? 's' : ''} · self-marked {v.selfMarks}/{v.outOf} · {v.submittedAt}</div>
                      {v.aiFlag && <Pill tone="warn" icon="⚠️" className="mt-1">{v.aiFlag}</Pill>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => act(v.id, 'tick')}>✓</Button>
                      <Button size="sm" variant="secondary" onClick={() => act(v.id, 'back')}>↩</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <SectionTitle title="At risk" subtitle="Missed 2+ of the last 5 days, or missed today" />
            <ul className="space-y-1.5">
              {AT_RISK.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl bg-page px-3 py-2 text-sm">
                  <Avatar name={s.name} size="sm" />
                  <span className="flex-1 font-semibold truncate">{s.name}</span>
                  <Pill tone="critical">{s.missedLast5 || 1} missed</Pill>
                  <Button size="sm" variant="ghost" onClick={() => setToast(`Personal message sent to ${s.name.split(' ')[0]} on WhatsApp.`)}>Message</Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <SectionTitle title="Score distribution" subtitle={`${submitted} submissions · today's warm-up`} />
          <BarChart data={SCORE_BUCKETS} height={170} valueSuffix=" students" />
        </Card>
        <Card>
          <SectionTitle title="Explain in class" subtitle="Questions most of the batch got wrong" />
          <ul className="space-y-2">
            {HARD_QUESTIONS.map((h) => (
              <li key={h.q} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{h.q}</span>
                <div className="w-28 h-2 rounded-full bg-brand-100 overflow-hidden"><div className="h-full bg-critical rounded-full" style={{ width: `${h.wrong}%` }} /></div>
                <span className="text-xs font-semibold text-ink-2 tabular w-14 text-right">{h.wrong}% wrong</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Pulled into tomorrow&apos;s in-app test automatically for students who missed them.</p>
        </Card>
      </div>
    </AppShell>
  );
}
