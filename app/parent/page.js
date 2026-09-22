'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import Sparkline from '@/components/viz/Sparkline';
import ChallengeGrid from '@/components/viz/ChallengeGrid';
import { Avatar, Button, Card, Pill, SectionTitle, StatTile, Toast, Toggle } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { CHALLENGE_PLAN, PARENT, fmtDate, fmtLong, mentorById, studentById } from '@/lib/mock-data';

const STATUS = { verified: ['good', '✓ Done and verified'], submitted: ['brand', '◔ Submitted, awaiting tick'], not_started: ['warn', '○ Not started yet'], missed: ['critical', '✕ Missed'] };

export default function ParentHome() {
  const { labels, challenge, schedule } = useSettings();
  const mentorProfile = useMentorProfile();
  const [childId, setChildId] = useState(PARENT.children[0]);
  const [digest, setDigest] = useState(true);
  const [toast, setToast] = useState('');
  const child = studentById(childId);
  const mentor = mentorById(child.mentorId);
  const mentorPhoto = mentor.id === 'm1' ? mentorProfile.photo : mentor.photo;
  const today = CHALLENGE_PLAN[child.day - 1];
  const [tone, statusText] = STATUS[child.status] || STATUS.not_started;
  const tests = [...child.tests].reverse();
  const onTrack = child.missedLast5 <= 1 && child.status !== 'missed';

  return (
    <AppShell role="parent" user={{ name: PARENT.name, sub: `${labels.parent} of ${PARENT.children.length}` }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rise">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-deep">Namaste, {PARENT.name.split(' ')[0]} 🙏</h1>
          <p className="text-sm text-ink-2">Read-only view. Updated 2 hours ago · {fmtLong(new Date(2026, 8, 22))}</p>
        </div>
        {PARENT.children.length > 1 && (
          <div className="flex gap-1 rounded-full bg-white border border-line p-1" role="tablist" aria-label="Choose child">
            {PARENT.children.map((id) => {
              const c = studentById(id);
              return (
                <button key={id} type="button" role="tab" aria-selected={childId === id} onClick={() => setChildId(id)} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${childId === id ? 'bg-brand text-white' : 'text-ink-2 hover:bg-page'}`}>
                  {c.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Card className="rise-2 grid md:grid-cols-[1fr_auto] gap-5 items-center">
        <div className="flex items-center gap-4">
          <Avatar name={child.name} src={child.photo} size="xl" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-brand-deep">{child.name}</h2>
              <Pill tone={onTrack ? 'good' : 'warn'} icon={onTrack ? '✓' : '!'}>{onTrack ? 'On track' : 'Needs attention'}</Pill>
            </div>
            <p className="text-sm text-ink-2">Student ID <span className="font-mono text-ink">{child.id}</span> · {child.batch} · joined {fmtDate(child.joined, false)}</p>
            <div className="mt-3 w-full max-w-md">
              <div className="flex justify-between text-xs text-ink-2 mb-1"><span>{challenge.days}-day {labels.challenge.toLowerCase()}</span><span><b className="text-ink">Day {child.day}</b> of {challenge.days}</span></div>
              <div className="h-2.5 rounded-full bg-brand-100 overflow-hidden"><div className="h-full bg-brand rounded-full" style={{ width: `${(child.day / challenge.days) * 100}%` }} /></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-page border border-line p-3">
          <Avatar name={mentor.name} src={mentorPhoto} size="lg" />
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wide text-ink-3">{labels.mentor}</div>
            <div className="font-display font-bold text-brand-deep">{mentor.name}</div>
            <div className="text-xs text-ink-2">{mentor.subject} · {mentor.qualification}</div>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => setToast(`${mentor.name.split(' ').slice(-1)[0]} will call you within a day.`)}>📞 Request a call</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 rise-3">
        <StatTile label="Today's task" value={<Pill tone={tone}>{statusText}</Pill>} hint={`Day ${child.day} · ${today.title}`} />
        <StatTile label={labels.streak} value={`${child.streak} days`} hint={`closes ${schedule.deadline} daily`} />
        <StatTile label="Average test %" value={child.avgScore != null ? `${child.avgScore}%` : '—'} hint={`${child.tests.length} tests so far`} />
        <StatTile label="Tasks completed" value={`${Math.max(0, child.day - 1 - (child.missedDays ? child.missedDays.length : child.missedLast5 || 0))}/${child.day - 1}`} hint="verified by mentor" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mt-4 rise-4">
        <Card id="tests">
          <SectionTitle title="Tests" subtitle="Test name and marks appear here as soon as the mentor confirms them" action={tests.length > 1 && <Sparkline values={child.tests.slice(-10).map((t) => t.pct)} width={120} height={32} />} />
          <div className="max-h-96 overflow-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3 sticky top-0"><tr><th className="px-3 py-2">Test</th><th className="px-3 py-2">Date</th><th className="px-3 py-2 text-right">Marks</th><th className="px-3 py-2 text-right">%</th></tr></thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.day} className="border-t border-line">
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2 text-xs text-ink-2 whitespace-nowrap">{fmtDate(t.date, false)}</td>
                    <td className="px-3 py-2 text-right tabular">{t.marks}/{t.outOf}</td>
                    <td className="px-3 py-2 text-right tabular font-semibold">{t.pct}%</td>
                  </tr>
                ))}
                {!tests.length && <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-3">No tests yet. The first one comes on Day 1.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <SectionTitle title={`${challenge.days}-day journey`} subtitle="Green is done, red is missed, gold is today" />
            <ChallengeGrid total={challenge.days} day={child.day} missedDays={child.missedDays || []} revisionEvery={challenge.revisionEvery} compact />
          </Card>
          <Card>
            <Toggle label="Sunday summary on WhatsApp" hint="The same numbers, every Sunday at 6 PM, so you never have to log in" checked={digest} onChange={(v) => { setDigest(v); setToast(v ? 'Sunday summary on.' : 'Sunday summary off.'); }} />
            <p className="text-[11px] text-ink-3 mt-1">Ranks are not shown to parents. Your child sees their own batch ranking in the student app.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
