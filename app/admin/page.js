'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import Sparkline from '@/components/viz/Sparkline';
import { MentorPodium, StarPerformers, TieBreakNote } from '@/components/rankings/Rankings';
import { Avatar, Button, Card, Pill, SectionTitle, StatTile, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { ADMIN, ALL_STUDENTS, CHALLENGE_PLAN, MENTORS, MENTOR_RANKING, STAR_PERFORMERS, TASK_TYPES, dayGroups, fmtLong } from '@/lib/mock-data';

function health(m) {
  if (m.completion < 65 || m.turnaround > 24) return { tone: 'critical', label: 'Action', icon: '●' };
  if (m.completion < 80 || m.turnaround > 12) return { tone: 'warn', label: 'Watch', icon: '●' };
  return { tone: 'good', label: 'Healthy', icon: '●' };
}

export default function AdminOverview() {
  const { labels, schedule, brand, challenge } = useSettings();
  const profile = useMentorProfile();
  const [toast, setToast] = useState('');
  const k = ADMIN.kpis;
  const alertTone = { critical: 'critical', warn: 'warn', brand: 'brand', good: 'good' };
  const groups = dayGroups(ALL_STUDENTS);
  const missingMaterial = CHALLENGE_PLAN.filter((p) => p.type === 'test' && !p.material).length;
  const photos = { m1: profile.photo };

  return (
    <AppShell role="admin" user={{ name: labels.admin, sub: brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 rise">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-deep">Every {labels.batch.toLowerCase()} at a glance</h1>
          <p className="text-sm text-ink-2">{fmtLong(new Date(2026, 8, 22))} · {MENTORS.length} {labels.mentor.toLowerCase()}s · {k.students} {labels.student.toLowerCase()}s · {challenge.days}-day {labels.challenge.toLowerCase()}</p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/mentors" variant="secondary">＋ Add {labels.mentor.toLowerCase()}</Button>
          <Button href="/admin/tasks">Open the {challenge.days}-day plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 rise-2">
        <StatTile label={`${labels.mentor}s`} value={MENTORS.length} hint={`${MENTORS.filter((m) => m.streak > 0).length} verified today`} />
        <StatTile label={`${labels.student}s`} value={k.students} hint={`${MENTORS.length} batches`} />
        <StatTile label="Active today" value={k.activeToday} delta="+9" hint="vs. yesterday" />
        <StatTile label="Completion" value={`${k.completion}%`} delta="+2" hint="all batches" />
        <StatTile label="Verify turnaround" value={`${k.turnaroundHrs}h`} delta="-3h" hint="avg" />
        <StatTile label="Seats free" value={k.seatsLeft} hint={`${schedule.seatsPerMentor} per mentor`} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 mt-4 rise-3">
        <Card className="bg-brand-gradient text-white border-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="accent" icon="🗓">Today across the school</Pill>
            <span className="text-xs text-white/70">closes {schedule.deadline} · every student on their own Day N</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {groups.slice(0, 5).map((g) => (
              <li key={g.day} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
                <span className="font-display font-bold w-16 shrink-0">Day {g.day}</span>
                <span aria-hidden="true">{TASK_TYPES[g.task.type].icon}</span>
                <span className="flex-1 truncate">{g.task.title}</span>
                <span className="text-white/70 tabular">{g.count}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
            <span>{groups.length} distinct days in play</span>
            <span>·</span>
            <span>{missingMaterial ? `${missingMaterial} test day${missingMaterial > 1 ? 's' : ''} still need${missingMaterial > 1 ? '' : 's'} a paper attached` : 'Every test day has its paper attached'}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button href="/admin/tasks" variant="accent" size="sm">Check tomorrow&apos;s tasks</Button>
            <Button variant="light" size="sm" onClick={() => setToast('Announcement sent to every student and mentor.')}>Push an announcement</Button>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Star performers" subtitle="Top 3 students across every batch" />
          <StarPerformers stars={STAR_PERFORMERS} linkBase="/admin/student?id=" compact />
          <TieBreakNote />
        </Card>
      </div>

      <Card className="mt-4 rise-4">
        <SectionTitle title={`Top ${labels.mentor.toLowerCase()}s`} subtitle={`${MENTORS.length} mentors ranked by average points per active student. Tap a card for the full profile and report.`} action={<Button href="/admin/mentors" size="sm" variant="ghost">All mentors →</Button>} />
        <MentorPodium ranking={MENTOR_RANKING} photos={photos} linkBase="/admin/mentor?id=" />
      </Card>

      <Card className="mt-4" pad="p-0">
        <div className="p-4 border-b border-line">
          <SectionTitle title={`${labels.mentor} scorecard`} subtitle="Verification speed, batch completion and average score. Health is icon + label, never colour alone." className="mb-0" action={<Button href="/admin/mentors" size="sm" variant="ghost">15 / 30-day reports →</Button>} />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
              <tr>
                <th className="px-4 py-2">{labels.mentor}</th>
                <th className="px-4 py-2">Seats</th>
                <th className="px-4 py-2">Completion · 7d</th>
                <th className="px-4 py-2 text-right">Turnaround</th>
                <th className="px-4 py-2 text-right">Avg score</th>
                <th className="px-4 py-2 text-right">🔥 Streak</th>
                <th className="px-4 py-2">Health</th>
              </tr>
            </thead>
            <tbody>
              {MENTORS.map((m) => {
                const h = health(m);
                return (
                  <tr key={m.id} className="border-t border-line hover:bg-page/60">
                    <td className="px-4 py-3"><a href={`/admin/mentor?id=${m.id}`} className="flex items-center gap-2 hover:text-brand"><Avatar name={m.name} src={photos[m.id] || m.photo} size="sm" /><span><span className="block font-semibold">{m.name}</span><span className="block text-xs text-ink-3">{m.batch} · {m.subject}</span></span></a></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-brand-100 overflow-hidden"><div className="h-full bg-brand rounded-full" style={{ width: `${(m.seats / schedule.seatsPerMentor) * 100}%` }} /></div><span className="text-xs tabular">{m.seats}/{schedule.seatsPerMentor}</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Sparkline values={m.trend} width={80} height={26} /><span className="font-semibold tabular">{m.completion}%</span></div></td>
                    <td className="px-4 py-3 text-right tabular">{m.turnaround}h</td>
                    <td className="px-4 py-3 text-right tabular">{m.avgScore}%</td>
                    <td className="px-4 py-3 text-right tabular">{m.streak}</td>
                    <td className="px-4 py-3"><Pill tone={h.tone} icon={h.icon}>{h.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4">
        <Card>
          <SectionTitle title="Alerts" subtitle="Rules you set in Customise fire these" />
          <ul className="space-y-2">
            {ADMIN.alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <Pill tone={alertTone[a.tone]} className="mt-0.5 shrink-0">{a.tone === 'critical' ? 'Action' : a.tone === 'warn' ? 'Watch' : a.tone === 'good' ? 'Win' : 'Info'}</Pill>
                <span className="flex-1">{a.text}</span>
                <span className="text-xs text-ink-3 whitespace-nowrap">{a.when}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
