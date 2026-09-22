'use client';
import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';
import RangePicker, { rangeFor } from '@/components/ui/RangePicker';
import BarChart from '@/components/viz/BarChart';
import Sparkline from '@/components/viz/Sparkline';
import { Avatar, Button, Card, Pill, SectionTitle, StatTile, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile, updateMentorProfile } from '@/lib/mentor-profile-store';
import { readPhoto } from '@/app/mentor/profile/page';
import { MENTOR_JOURNEY, MENTOR_RANKING, fmtDate, fmtLong, mentorById, mentorReport, studentsOf } from '@/lib/mock-data';

function Inner() {
  const params = useSearchParams();
  const { labels, brand, schedule, challenge } = useSettings();
  const profile = useMentorProfile();
  const [range, setRange] = useState(rangeFor(15));
  const [toast, setToast] = useState('');
  const m = mentorById(params.get('id'));
  const photo = m.id === 'm1' ? profile.photo : m.photo;
  const rank = MENTOR_RANKING.find((x) => x.id === m.id);
  const students = useMemo(() => [...studentsOf(m.id)].sort((a, b) => b.points - a.points), [m.id]);
  const report = useMemo(() => mentorReport(m.id, range.from, range.to), [m.id, range]);
  const bars = report.rows.map((r) => ({ label: `${r.date.getDate()}`, value: r.completion }));

  function onPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (m.id !== 'm1') return setToast('In this demo only Dr. Anjali Rao\'s photo is editable.');
    readPhoto(f, (dataUrl) => { updateMentorProfile({ photo: dataUrl }); setToast('Photo replaced.'); });
  }

  return (
    <AppShell role="admin" user={{ name: labels.admin, sub: brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Button href="/admin/mentors" variant="ghost" size="sm">← {labels.mentor}s</Button>
        <div className="flex gap-2">
          <label className="inline-flex"><input type="file" accept="image/*" className="hidden" onChange={onPhoto} /><span className="inline-flex items-center rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-brand-deep hover:bg-brand-soft cursor-pointer">Replace photo</span></label>
          <Button size="sm" variant="secondary" onClick={() => setToast('Edit form opened.')}>Edit details</Button>
          <Button size="sm" variant="secondary" onClick={() => setToast('Hand-over started: pick the mentor who takes this batch.')}>Hand over batch</Button>
        </div>
      </div>

      <Card className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
        <Avatar name={m.name} src={photo} size="xl" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-brand-deep">{m.name}</h1>
            {rank && <Pill tone={rank.rank <= 3 ? 'accent' : 'neutral'}>#{rank.rank} of {MENTOR_RANKING.length}</Pill>}
            <Pill tone={m.streak > 0 ? 'good' : 'critical'} icon="🔥">{m.streak}-day streak</Pill>
          </div>
          <p className="text-sm text-ink-2 mt-1">{m.subject} · {m.qualification} · {m.batch}{m.batchNick ? ` (${m.batchNick})` : ''} · joined {fmtLong(m.joined)}</p>
          <p className="text-sm text-ink-2">📞 {m.id === 'm1' && profile.phone ? profile.phone : m.phone} · ✉️ {m.email}</p>
          {m.id === 'm1' && profile.bio && <p className="text-sm text-ink mt-1 italic">“{profile.bio}”</p>}
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-page p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Seats</div><div className="font-display text-xl font-bold text-brand-deep tabular">{m.seats}/{schedule.seatsPerMentor}</div></div>
          <div className="rounded-xl bg-page p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Verified</div><div className="font-display text-xl font-bold text-brand-deep tabular">{m.verifications.toLocaleString('en-IN')}</div></div>
          <div className="rounded-xl bg-page p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Avg / student</div><div className="font-display text-xl font-bold text-brand-deep tabular">{rank?.avgPoints.toLocaleString('en-IN') || 0}</div></div>
          <div className="rounded-xl bg-page p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Total pts</div><div className="font-display text-xl font-bold text-brand-deep tabular">{rank?.totalPoints.toLocaleString('en-IN') || 0}</div></div>
        </div>
      </Card>

      <Card className="mt-4" pad="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-deep">Report</h2>
            <p className="text-xs text-ink-2">{fmtDate(range.from)} to {fmtDate(range.to)} · {report.rows.length} days</p>
          </div>
          <RangePicker value={range} onChange={setRange} />
        </div>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-6 gap-3">
          <StatTile label="Completion" value={`${report.completion}%`} />
          <StatTile label="Verified" value={report.verified.toLocaleString('en-IN')} hint="uploads + tests" />
          <StatTile label="Turnaround" value={`${report.turnaround}h`} hint="avg" />
          <StatTile label="Avg test %" value={`${report.avgScore}%`} />
          <StatTile label="Streaks kept" value={report.streaksKept} hint={`of ${m.seats}`} />
          <StatTile label="At risk" value={report.atRisk} deltaGood={false} />
        </div>
        <div className="px-4 pb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Daily completion</div>
          <BarChart data={bars} height={150} valueSuffix="%" />
        </div>
      </Card>

      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-4 mt-4">
        <Card>
          <SectionTitle title="Journey" subtitle="Since joining" action={<Sparkline values={m.trend} width={100} height={30} />} />
          <ol className="relative border-l border-line ml-2 space-y-3">
            {(MENTOR_JOURNEY[m.id] || [{ when: fmtDate(m.joined, false), what: 'Invited. Waiting for first login.' }]).map((j, i) => (
              <li key={i} className="pl-4">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand ring-4 ring-white" />
                <div className="text-xs text-ink-3">{j.when}</div>
                <div className="text-sm">{j.what}</div>
              </li>
            ))}
          </ol>
        </Card>
        <Card pad="p-0">
          <div className="p-4 border-b border-line"><SectionTitle title={`${m.batch} students`} subtitle={`${students.length} students · tap a name for the full profile`} className="mb-0" /></div>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3 sticky top-0"><tr><th className="px-4 py-2">{labels.student}</th><th className="px-4 py-2">Day</th><th className="px-4 py-2 text-right">🔥</th><th className="px-4 py-2 text-right">Avg %</th><th className="px-4 py-2 text-right">{labels.points}</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-line hover:bg-page/60">
                    <td className="px-4 py-2"><Link href={`/admin/student?id=${s.id}`} className="flex items-center gap-2 hover:text-brand"><Avatar name={s.name} size="sm" /><span><span className="block font-semibold">{s.name}</span><span className="block text-[11px] text-ink-3 font-mono">{s.id}</span></span></Link></td>
                    <td className="px-4 py-2 tabular">{s.day}/{challenge.days}</td>
                    <td className="px-4 py-2 text-right tabular">{s.streak}</td>
                    <td className="px-4 py-2 text-right tabular">{s.avgScore}%</td>
                    <td className="px-4 py-2 text-right tabular font-semibold">{s.points.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {!students.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-3">No students yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

export default function AdminMentorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Inner />
    </Suspense>
  );
}
