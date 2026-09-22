'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/shell/AppShell';
import RangePicker, { rangeFor } from '@/components/ui/RangePicker';
import Sparkline from '@/components/viz/Sparkline';
import { Avatar, Button, Card, Field, Pill, SectionTitle, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { MENTORS, MENTOR_RANKING, fmtDate, mentorReport } from '@/lib/mock-data';

export default function MentorsPage() {
  const { labels, brand, schedule } = useSettings();
  const profile = useMentorProfile();
  const [mentors, setMentors] = useState(MENTORS);
  const [range, setRange] = useState(rangeFor(15));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Biology', batch: `Batch ${String.fromCharCode(65 + MENTORS.length)}` });
  const [toast, setToast] = useState('');
  const photos = { m1: profile.photo };
  const reports = useMemo(() => Object.fromEntries(mentors.map((m) => [m.id, mentorReport(m.id, range.from, range.to)])), [mentors, range]);
  const rankOf = (id) => MENTOR_RANKING.find((m) => m.id === id)?.rank;

  function addMentor(e) {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) return setToast('Phone must be 10 digits.');
    const id = `m${mentors.length + 1}`;
    setMentors((ms) => ms.concat([{ id, name: form.name, batch: form.batch, batchNick: '', subject: form.subject, qualification: '', phone: form.phone, email: form.email, joined: new Date(2026, 8, 22), photo: '', streak: 0, seats: 0, completion: 0, turnaround: 0, avgScore: 0, publishedAt: null, trend: [0, 0, 0, 0, 0, 0, 0], verifications: 0 }]));
    setForm({ name: '', email: '', phone: '', subject: 'Biology', batch: `Batch ${String.fromCharCode(66 + mentors.length)}` });
    setShowForm(false);
    setToast(`${form.name} invited by email and WhatsApp. ${form.batch} created with ${schedule.seatsPerMentor} seats.`);
  }

  return (
    <AppShell role="admin" user={{ name: labels.admin, sub: brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">{labels.mentor}s</h1>
          <p className="text-sm text-ink-2">{mentors.length} mentors · {mentors.reduce((a, m) => a + m.seats, 0)} students seated · one mentor holds up to {schedule.seatsPerMentor}</p>
        </div>
        <div className="flex gap-2">
          <label className="inline-flex"><input type="file" accept=".csv,.xlsx" className="hidden" onChange={() => setToast('Sheet parsed: 2 mentors ready, 0 errors. Invites sent.')} /><span className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep hover:bg-brand-soft cursor-pointer">⬆ Import CSV</span></label>
          <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close' : `＋ Add ${labels.mentor.toLowerCase()} manually`}</Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <form onSubmit={addMentor}>
            <SectionTitle title={`Add one ${labels.mentor.toLowerCase()}`} subtitle="They get an invite by email and WhatsApp, set a password on first login, and upload their own photo." />
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Full name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Email"><input className="input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Phone"><input className="input" required inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></Field>
              <Field label="Subject"><select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>{['Biology', 'Physics', 'Chemistry'].map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label={`${labels.batch} name`}><input className="input" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></Field>
              <div className="flex items-end"><Button type="submit" className="w-full">Invite {labels.mentor.toLowerCase()}</Button></div>
            </div>
          </form>
        </Card>
      )}

      <Card pad="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-deep">Reports</h2>
            <p className="text-xs text-ink-2">{fmtDate(range.from)} to {fmtDate(range.to)} · tap a mentor for the full profile and journey</p>
          </div>
          <RangePicker value={range} onChange={setRange} />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
              <tr><th className="px-4 py-2">{labels.mentor}</th><th className="px-4 py-2">Rank</th><th className="px-4 py-2">Completion</th><th className="px-4 py-2 text-right">Verified</th><th className="px-4 py-2 text-right">Turnaround</th><th className="px-4 py-2 text-right">Avg test %</th><th className="px-4 py-2 text-right">Streaks kept</th><th className="px-4 py-2 text-right">At risk</th></tr>
            </thead>
            <tbody>
              {mentors.map((m) => {
                const r = reports[m.id];
                return (
                  <tr key={m.id} className="border-t border-line hover:bg-page/60">
                    <td className="px-4 py-3"><Link href={`/admin/mentor?id=${m.id}`} className="flex items-center gap-2 hover:text-brand"><Avatar name={m.name} src={photos[m.id] || m.photo} size="sm" /><span><span className="block font-semibold">{m.name}</span><span className="block text-xs text-ink-3">{m.batch} · {m.subject} · {m.seats}/{schedule.seatsPerMentor}</span></span></Link></td>
                    <td className="px-4 py-3">{rankOf(m.id) ? <Pill tone={rankOf(m.id) <= 3 ? 'accent' : 'neutral'}>#{rankOf(m.id)}</Pill> : <Pill tone="warn">Invited</Pill>}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Sparkline values={r.rows.map((x) => x.completion)} width={90} height={26} /><span className="font-semibold tabular">{r.completion}%</span></div></td>
                    <td className="px-4 py-3 text-right tabular">{r.verified.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right tabular">{r.turnaround}h</td>
                    <td className="px-4 py-3 text-right tabular">{r.avgScore}%</td>
                    <td className="px-4 py-3 text-right tabular">{r.streaksKept}</td>
                    <td className="px-4 py-3 text-right tabular">{r.atRisk}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-line flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => setToast('Report downloaded as PDF.')}>⬇ PDF</Button><Button variant="secondary" size="sm" onClick={() => setToast('Report downloaded as CSV.')}>⬇ CSV</Button></div>
      </Card>
    </AppShell>
  );
}
