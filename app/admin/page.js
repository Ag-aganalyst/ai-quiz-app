'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import Sparkline from '@/components/viz/Sparkline';
import { Avatar, Button, Card, Pill, SectionTitle, StatTile, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { ADMIN } from '@/lib/mock-data';

function health(m) {
  if (!m.publishedAt || m.completion < 65 || m.turnaround > 24) return { tone: 'critical', label: 'Action', icon: '●' };
  if (m.completion < 80 || m.turnaround > 12) return { tone: 'warn', label: 'Watch', icon: '●' };
  return { tone: 'good', label: 'Healthy', icon: '●' };
}

export default function AdminOverview() {
  const { labels, schedule, brand } = useSettings();
  const [waiting, setWaiting] = useState(ADMIN.waiting);
  const [toast, setToast] = useState('');
  const k = ADMIN.kpis;
  const alertTone = { critical: 'critical', warn: 'warn', brand: 'brand', good: 'good' };

  return (
    <AppShell role="admin" user={{ name: 'Owner', sub: brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 rise">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-deep">Every {labels.batch.toLowerCase()} at a glance</h1>
          <p className="text-sm text-ink-2">Saturday, 19 September · {ADMIN.mentors.length} {labels.mentor.toLowerCase()}s · {k.students} {labels.student.toLowerCase()}s</p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/settings" variant="secondary">🎨 Customise</Button>
          <Button onClick={() => setToast('Master task published to every batch. Mentors can swap it for their own.')}>Publish a master task</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 rise-2">
        <StatTile label={`${labels.student}s`} value={k.students} hint={`${ADMIN.mentors.length} batches`} />
        <StatTile label="Active today" value={k.activeToday} delta="+9" hint="vs. yesterday" />
        <StatTile label="Completion" value={`${k.completion}%`} delta="+2" hint="all batches" />
        <StatTile label="Verify turnaround" value={`${k.turnaroundHrs}h`} delta="-3h" hint="avg" />
        <StatTile label="Waiting for seat" value={waiting.length} hint={`${k.seatsLeft} seats free`} />
        <StatTile label="Seats left" value={k.seatsLeft} hint={`${schedule.seatsPerMentor} per mentor`} />
      </div>

      <Card className="mt-4 rise-3" pad="p-0">
        <div className="p-4 border-b border-line">
          <SectionTitle title={`${labels.mentor} scorecard`} subtitle="Assignment consistency, verification speed, batch completion and average score. Health is icon + label, never colour alone." className="mb-0" />
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
                <th className="px-4 py-2">Published today</th>
                <th className="px-4 py-2 text-right">🔥 Streak</th>
                <th className="px-4 py-2">Health</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN.mentors.map((m) => {
                const h = health(m);
                return (
                  <tr key={m.name} className="border-t border-line hover:bg-page/60">
                    <td className="px-4 py-3"><span className="flex items-center gap-2"><Avatar name={m.name} size="sm" /><span><span className="block font-semibold">{m.name}</span><span className="block text-xs text-ink-3">{m.batch}</span></span></span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-brand-100 overflow-hidden"><div className="h-full bg-brand rounded-full" style={{ width: `${(m.students / schedule.seatsPerMentor) * 100}%` }} /></div><span className="text-xs tabular">{m.students}/{schedule.seatsPerMentor}</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Sparkline values={m.trend} width={80} height={26} /><span className="font-semibold tabular">{m.completion}%</span></div></td>
                    <td className="px-4 py-3 text-right tabular">{m.turnaround}h</td>
                    <td className="px-4 py-3 text-right tabular">{m.avgScore}%</td>
                    <td className="px-4 py-3">{m.publishedAt ? <span className="text-xs">{m.publishedAt}</span> : <Pill tone="critical">Not yet</Pill>}</td>
                    <td className="px-4 py-3 text-right tabular">{m.streak}</td>
                    <td className="px-4 py-3"><Pill tone={h.tone} icon={h.icon}>{h.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 mt-4 rise-4">
        <Card>
          <SectionTitle title="Waiting list" subtitle="Students a mentor's sheet could not seat. Place them with a mentor who has room." />
          {waiting.length === 0 ? (
            <div className="rounded-xl bg-brand-soft p-4 text-sm text-brand-700 text-center">Nobody is waiting. 🎉</div>
          ) : (
            <ul className="space-y-2">
              {waiting.map((w) => (
                <li key={w.email} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
                  <Avatar name={w.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{w.name}</div>
                    <div className="text-xs text-ink-2">from {w.from} · waiting {w.since} · {w.email}</div>
                  </div>
                  <Button size="sm" onClick={() => { setWaiting((l) => l.filter((x) => x.email !== w.email)); setToast(`${w.name} placed in Batch D and emailed a Student ID.`); }}>Place in Batch D</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
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

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {[
          { icon: '🎨', title: 'Branding and labels', body: 'Logo, colours, corner radius and what you call mentors, batches and points.', href: '/admin/settings?tab=brand' },
          { icon: '🏅', title: 'Points and streaks', body: 'Every value in the economy, freeze rules, milestones and the late window.', href: '/admin/settings?tab=points' },
          { icon: '🗓', title: 'Schedule and features', body: 'Deadlines, rest days, seats per mentor, WhatsApp, teams, seasons and more.', href: '/admin/settings?tab=schedule' },
        ].map((c) => (
          <Card key={c.title} lift>
            <div className="text-2xl" aria-hidden="true">{c.icon}</div>
            <div className="font-display font-bold text-brand-deep mt-1">{c.title}</div>
            <p className="text-sm text-ink-2 mt-1">{c.body}</p>
            <Button href={c.href} variant="ghost" size="sm" className="mt-2 -ml-2">Open →</Button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
