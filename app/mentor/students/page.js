'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/shell/AppShell';
import { Avatar, Button, Card, Field, Pill, SectionTitle, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { MENTOR, STUDENTS } from '@/lib/mock-data';

const DEMO_ROWS = [
  ['Aarohi Deshmukh', '9811022334', 'aarohi.d@example.com', 'Rajesh Deshmukh', '9711022334'],
  ['Mohit Bansal', '9822033445', 'mohit.b@example.com'],
  ['Zoya Ansari', '98330', 'zoya.a@example.com'],
  ['', '9844055667', 'noname@example.com'],
  ['Pranav Hegde', '9855066778', 'pranav.h@gmial.com'],
  ['Riya Sharma', '9866077889', 'riya.01@example.com'],
  ['Mohit Bansal', '9822033445', 'mohit.b@example.com'],
  ['Kiara Sethi', '9877088990', 'kiara.s@example.com'],
];

function validate(rows, existing, seatsLeft) {
  const seenEmail = new Set();
  const seenPhone = new Set();
  let placed = 0;
  return rows.map(([name, phone, email, parentName = '', parentPhone = '']) => {
    const problems = [];
    if (!name?.trim()) problems.push('Name missing');
    if (!/^\d{10}$/.test(phone || '')) problems.push('Phone must be 10 digits');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) problems.push('Invalid email');
    if (/gmial\.com|gamil\.com/i.test(email || '')) problems.push('Typo? did you mean gmail.com');
    if (seenEmail.has(email) || seenPhone.has(phone)) problems.push('Duplicate row in sheet');
    seenEmail.add(email);
    seenPhone.add(phone);
    const exists = existing.find((s) => s.email === email || s.phone === phone);
    let state = problems.length ? 'fix' : 'ready';
    if (!problems.length && exists) {
      state = 'skip';
      problems.push(`Already enrolled${exists.batch ? ` in ${exists.batch}` : ''}`);
    }
    if (state === 'ready') {
      placed += 1;
      if (placed > seatsLeft) {
        state = 'skip';
        problems.push('Batch is full: every mentor holds 50');
      }
    }
    if (parentPhone && !/^\d{10}$/.test(parentPhone)) problems.push('Parent phone must be 10 digits');
    return { name, phone, email, parentName, parentPhone, state, problems };
  });
}

export default function StudentsPage() {
  const { labels, schedule } = useSettings();
  const profile = useMentorProfile();
  const [roster, setRoster] = useState(STUDENTS.map((s) => ({ ...s, batch: MENTOR.batch })));
  const [rows, setRows] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', parentName: '', parentPhone: '' });
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');
  const seatsLeft = Math.max(0, schedule.seatsPerMentor - roster.length);
  const existing = useMemo(() => roster.concat([{ email: 'riya.01@example.com', phone: '9866077889', batch: 'Batch C' }]), [roster]);
  const preview = useMemo(() => (rows ? validate(rows, existing, seatsLeft) : null), [rows, existing, seatsLeft]);
  const filtered = roster.filter((s) => `${s.name} ${s.id} ${s.email}`.toLowerCase().includes(q.toLowerCase()));

  function downloadTemplate() {
    const csv = 'Name,Phone,Email,Parent name,Parent phone\nExample Student,9876543210,example@email.com,Example Parent,9876501234\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'brainy-media-students-template.csv';
    a.click();
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (/\.csv$/i.test(f.name)) {
      f.text().then((t) => {
        const parsed = t.split(/\r?\n/).slice(1).filter(Boolean).map((l) => l.split(',').map((c) => c.trim()));
        setRows(parsed.length ? parsed : DEMO_ROWS);
      });
    } else {
      setRows(DEMO_ROWS);
      setToast(`Parsed ${f.name} (demo rows shown).`);
    }
  }

  function confirm() {
    const ready = preview.filter((r) => r.state === 'ready');
    const start = 151 + roster.length;
    setRoster((r) => r.concat(ready.map((x, i) => ({ id: `BM-26-0${start + i}`, name: x.name, phone: x.phone, email: x.email, parent: { name: x.parentName, phone: x.parentPhone }, status: 'not_started', streak: 0, points: 0, day: 1, activation: 'Invited', batch: MENTOR.batch }))));
    setRows(null);
    setToast(`${ready.length} enrolled and emailed their Student ID.`);
  }

  function addOne(e) {
    e.preventDefault();
    const [row] = validate([[form.name, form.phone, form.email, form.parentName, form.parentPhone]], existing, seatsLeft);
    if (row.state !== 'ready') return setToast(row.problems[0] || 'Check the details.');
    setRoster((r) => r.concat([{ id: `BM-26-0${151 + r.length}`, name: row.name, phone: row.phone, email: row.email, parent: { name: row.parentName, phone: row.parentPhone }, status: 'not_started', streak: 0, points: 0, day: 1, activation: 'Invited', batch: MENTOR.batch }]));
    setForm({ name: '', phone: '', email: '', parentName: '', parentPhone: '' });
    setShowForm(false);
    setToast(`${row.name} enrolled. Student ID emailed${row.parentPhone ? ', parent messaged on WhatsApp' : ''}. Day 1 starts today.`);
  }

  const tone = { ready: 'good', fix: 'warn', skip: 'critical' };
  const label = { ready: 'Ready', fix: 'Needs a fix', skip: 'Will skip' };

  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch, photo: profile.photo }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">{labels.student}s</h1>
          <p className="text-sm text-ink-2">{roster.length} of {schedule.seatsPerMentor} seats filled · <b className={seatsLeft ? 'text-brand-700' : 'text-critical'}>{seatsLeft} left</b></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48 h-2 rounded-full bg-brand-100 overflow-hidden"><div className={`h-full rounded-full ${seatsLeft ? 'bg-brand' : 'bg-critical'}`} style={{ width: `${Math.min(100, (roster.length / schedule.seatsPerMentor) * 100)}%` }} /></div>
          <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close' : `＋ Add one ${labels.student.toLowerCase()}`}</Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <form onSubmit={addOne}>
            <SectionTitle title={`Add one ${labels.student.toLowerCase()}`} subtitle="Same checks as the sheet. They get their Student ID by email, and the parent gets a WhatsApp, immediately." />
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Phone"><input className="input" required inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></Field>
              <Field label="Email"><input className="input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label={`${labels.parent} name`} hint="Optional"><input className="input" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></Field>
              <Field label={`${labels.parent} phone`} hint={`Enables the ${labels.parent.toLowerCase()} portal`}><input className="input" inputMode="numeric" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></Field>
              <div className="flex items-end"><Button type="submit" className="w-full" disabled={!seatsLeft}>{seatsLeft ? 'Enrol and send Student ID' : 'Batch full'}</Button></div>
            </div>
          </form>
        </Card>
      )}

      <Card className="mb-4">
        <SectionTitle title={`Add ${labels.student.toLowerCase()}s from Excel`} subtitle={`Columns: Name, Phone, Email, ${labels.parent} name, ${labels.parent} phone. Every row is checked before a single message goes out.`} action={<Button variant="ghost" size="sm" onClick={downloadTemplate}>⬇ Download template</Button>} />
        {!rows ? (
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-brand-200 bg-brand-soft p-8 text-center hover:border-brand transition">
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
            <div className="text-4xl" aria-hidden="true">📊</div>
            <div className="mt-2 font-display font-bold text-brand-deep">Drop your .xlsx or .csv here</div>
            <div className="text-xs text-ink-3 mt-1">or click to choose · {seatsLeft} seats available</div>
            <button type="button" className="mt-3 text-xs text-brand underline-offset-2 hover:underline" onClick={(e) => { e.preventDefault(); setRows(DEMO_ROWS); }}>Try with a sample sheet</button>
          </label>
        ) : (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {['ready', 'fix', 'skip'].map((k) => (
                <Pill key={k} tone={tone[k]}>{label[k]} · {preview.filter((r) => r.state === k).length}</Pill>
              ))}
            </div>
            <div className="overflow-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
                  <tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Status</th></tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-3 py-2 text-ink-3 tabular">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold">{r.name || <span className="text-critical">—</span>}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.phone}</td>
                      <td className="px-3 py-2 text-xs">{r.email}</td>
                      <td className="px-3 py-2"><Pill tone={tone[r.state]}>{label[r.state]}</Pill>{r.problems.length > 0 && <div className="text-[11px] text-ink-2 mt-1">{r.problems.join(' · ')}</div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-ink-3">Fix rows in your sheet and re-upload, or enrol the ready ones now.</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setRows(null)}>Re-upload</Button>
                <Button onClick={confirm} disabled={!preview.some((r) => r.state === 'ready')}>Enrol {preview.filter((r) => r.state === 'ready').length} and send Student IDs</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card pad="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
          <h2 className="font-display text-lg font-bold text-brand-deep">Roster</h2>
          <input className="input max-w-xs" placeholder="Search name, ID or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
              <tr><th className="px-4 py-2">{labels.student}</th><th className="px-4 py-2">ID</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2">Activation</th><th className="px-4 py-2 text-right">{labels.streak}</th><th className="px-4 py-2 text-right">{labels.points}</th><th className="px-4 py-2"></th></tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((s) => (
                <tr key={s.id} className="border-t border-line hover:bg-page/60">
                  <td className="px-4 py-2"><Link href={`/mentor/student?id=${s.id}`} className="flex items-center gap-2 hover:text-brand"><Avatar name={s.name} size="sm" /><span className="font-semibold">{s.name}</span><span className="text-[11px] text-ink-3">Day {s.day || 1}</span></Link></td>
                  <td className="px-4 py-2 font-mono text-xs">{s.id}</td>
                  <td className="px-4 py-2 font-mono text-xs">{s.phone}</td>
                  <td className="px-4 py-2"><Pill tone={s.activation === 'Active' ? 'good' : 'warn'}>{s.activation}</Pill></td>
                  <td className="px-4 py-2 text-right tabular">🔥 {s.streak}</td>
                  <td className="px-4 py-2 text-right tabular font-semibold">{s.points.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2 text-right">{s.activation === 'Invited' && <Button size="sm" variant="ghost" onClick={() => setToast(`Invite re-sent to ${s.email}`)}>Resend invite</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
