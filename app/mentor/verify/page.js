'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import SheetPlaceholder from '@/components/viz/SheetPlaceholder';
import Modal from '@/components/ui/Modal';
import { Avatar, Button, Card, EmptyState, Field, Pill, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { addTestRecord, updateTestRecord, useTestRecords } from '@/lib/test-records-store';
import { ANCHOR, MAX_MARKS_OPTIONS, MENTOR, STUDENTS, TEST_RECORD_STATUS, TEST_TYPES, VERIFY_QUEUE, fmtDate, isoDate, studentById } from '@/lib/mock-data';

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

const EMPTY_FORM = { studentId: '', type: '', max: '', obtained: '', date: isoDate(ANCHOR), testId: '' };
const FILTERS = [['analysis_uploaded', 'To verify'], ['awaiting_analysis', 'Analysis due'], ['sent_back', 'Sent back'], ['verified', 'Verified'], ['all', 'All']];

function TestRecordsTab({ onToast }) {
  const { labels, points: P } = useSettings();
  const all = useTestRecords().filter((r) => studentById(r.studentId)?.mentorId === MENTOR.id);
  const [filter, setFilter] = useState('analysis_uploaded');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState('');
  const rows = (filter === 'all' ? all : all.filter((r) => r.status === filter)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const selected = all.find((r) => r.id === selectedId) || rows[0];
  const counts = Object.fromEntries(FILTERS.map(([k]) => [k, k === 'all' ? all.length : all.filter((r) => r.status === k).length]));

  function save(e, next) {
    e.preventDefault();
    const max = Number(form.max);
    const obtained = Number(form.obtained);
    if (!form.studentId || !form.type || !max || !form.testId.trim()) return onToast('Fill every field marked *.');
    if (Number.isNaN(obtained) || obtained < 0 || obtained > max) return onToast(`Obtained marks must be between 0 and ${max}.`);
    const rec = addTestRecord({ studentId: form.studentId, type: form.type, max, obtained, date: form.date, testId: form.testId.trim().toUpperCase(), addedBy: MENTOR.id });
    const name = studentById(form.studentId)?.name.split(' ')[0];
    onToast(`${rec.testId} added for ${name}: ${obtained}/${max}. ${name} is asked to upload the analysis.`);
    setForm(next ? { ...form, studentId: '', obtained: '' } : EMPTY_FORM);
    if (!next) setOpen(false);
  }
  function verify(r) {
    updateTestRecord(r.id, { status: 'verified', files: [], verifiedOn: isoDate(ANCHOR) });
    onToast(`${r.testId} verified for ${studentById(r.studentId)?.name.split(' ')[0]}. +${P.testAnalysis} ${labels.points}. Files deleted.`);
  }
  function sendBack(r) {
    if (!reason.trim()) return onToast('Write one line on what to redo.');
    updateTestRecord(r.id, { status: 'sent_back', files: [], reason: reason.trim() });
    setReason('');
    onToast(`Sent back to ${studentById(r.studentId)?.name.split(' ')[0]}.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${filter === k ? 'bg-brand text-white ring-brand' : 'bg-white text-ink-2 ring-line hover:ring-brand-200'}`}>{label} · {counts[k]}</button>
          ))}
        </div>
        <Button onClick={() => setOpen(true)}>＋ Add test record</Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <Card pad="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3"><tr><th className="px-3 py-2">{labels.student}</th><th className="px-3 py-2">Test</th><th className="px-3 py-2 text-right">Marks</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Status</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const s = studentById(r.studentId);
                  const st = TEST_RECORD_STATUS[r.status];
                  return (
                    <tr key={r.id} onClick={() => setSelectedId(r.id)} className={`border-t border-line cursor-pointer ${selected?.id === r.id ? 'bg-brand-soft' : 'hover:bg-page/60'}`}>
                      <td className="px-3 py-2"><span className="flex items-center gap-2"><Avatar name={s?.name || ''} size="sm" /><span className="font-semibold">{s?.name}</span></span></td>
                      <td className="px-3 py-2"><span className="font-semibold">{r.testId}</span><span className="block text-[11px] text-ink-3">{r.type}</span></td>
                      <td className="px-3 py-2 text-right tabular"><b>{r.obtained}</b>/{r.max} <span className="text-xs text-ink-3">({Math.round((r.obtained / r.max) * 100)}%)</span></td>
                      <td className="px-3 py-2 text-xs text-ink-2 whitespace-nowrap">{fmtDate(new Date(`${r.date}T00:00:00`), false)}</td>
                      <td className="px-3 py-2"><Pill tone={st.tone} icon={st.icon}>{st.label}</Pill></td>
                    </tr>
                  );
                })}
                {!rows.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-ink-3">Nothing here. Add a test record or change the filter.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-3">
          {!selected ? (
            <EmptyState icon="📈" title="Pick a record" body="Select a row to see the student's analysis and verify it." />
          ) : (
            <>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{selected.testId} · {selected.type}</div>
                <div className="font-display text-lg font-bold text-brand-deep">{studentById(selected.studentId)?.name}</div>
                <div className="text-sm text-ink-2"><b>{selected.obtained}/{selected.max}</b> · {Math.round((selected.obtained / selected.max) * 100)}% · {fmtDate(new Date(`${selected.date}T00:00:00`))}</div>
              </div>
              {selected.status === 'analysis_uploaded' && (
                <>
                  <div className="text-xs text-ink-2">Uploaded {selected.uploadedAt} · {selected.files.length} file{selected.files.length === 1 ? '' : 's'}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.files.map((f, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-line bg-page">
                        <div className="aspect-[3/4]"><SheetPlaceholder seed={i + 21} /></div>
                        <div className="px-2 py-1 text-[11px] text-ink-2 truncate">📎 {f.name}</div>
                      </div>
                    ))}
                  </div>
                  <Button size="lg" className="w-full" onClick={() => verify(selected)}>✓ Verify analysis</Button>
                  <textarea className="input text-sm" rows={2} placeholder="Send back with one line: what to redo" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <Button size="lg" variant="secondary" className="w-full" onClick={() => sendBack(selected)}>↩ Send back</Button>
                  <p className="text-[11px] text-ink-3">Verifying awards +{P.testAnalysis} {labels.points} and deletes the uploaded files. Nothing is stored afterwards.</p>
                </>
              )}
              {(selected.status === 'awaiting_analysis' || selected.status === 'sent_back') && (
                <>
                  <div className="rounded-xl bg-[#fff4d6] border border-[#f7dc9a] px-3 py-2 text-sm text-[#7a5200]">{selected.status === 'sent_back' ? `Sent back: ${selected.reason}` : 'Score is live for the student and the parent. Waiting for the analysis upload.'}</div>
                  <Button size="lg" variant="secondary" className="w-full" onClick={() => onToast(`Reminder sent to ${studentById(selected.studentId)?.name.split(' ')[0]}.`)}>Remind to upload</Button>
                </>
              )}
              {selected.status === 'verified' && <div className="rounded-xl bg-[#f3fbf3] border border-[#bfe6bf] px-3 py-2 text-sm text-[#006300]">✓ Verified on {fmtDate(new Date(`${selected.verifiedOn}T00:00:00`))}. Files deleted.</div>}
            </>
          )}
        </Card>
      </div>

      <Modal open={open} title="Add Test Record" onClose={() => setOpen(false)}>
        <form onSubmit={(e) => save(e, false)} className="space-y-4">
          <Field label={`${labels.student} *`}>
            <select className="input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
              <option value="">Select student</option>
              {STUDENTS.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.id}</option>)}
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Test Type *">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                <option value="">Select type</option>
                {TEST_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Maximum Marks *">
              <select className="input" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} required>
                <option value="">Max marks</option>
                {MAX_MARKS_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Obtained Marks *"><input className="input" type="number" min={0} max={form.max || undefined} inputMode="numeric" value={form.obtained} onChange={(e) => setForm({ ...form, obtained: e.target.value })} required /></Field>
            <Field label="Test Date *"><input className="input" type="date" value={form.date} max={isoDate(ANCHOR)} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></Field>
          </div>
          <Field label="Test ID *"><input className="input" placeholder="e.g. UT-27-03, PT-03, MOCK-01" value={form.testId} onChange={(e) => setForm({ ...form, testId: e.target.value })} required /></Field>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" variant="secondary" onClick={(e) => save(e, true)}>Add & next student</Button>
            <Button type="submit">Add Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function VerifyPage() {
  const profile = useMentorProfile();
  const [tab, setTab] = useState('daily');
  const [toast, setToast] = useState('');
  const toVerify = useTestRecords().filter((r) => r.status === 'analysis_uploaded' && studentById(r.studentId)?.mentorId === MENTOR.id).length;
  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch, photo: profile.photo }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">Verification inbox</h1>
          <p className="text-sm text-ink-2">Daily uploads, and the tests your students take at the centre. Target: 50 in under 15 minutes.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-white border border-line p-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'daily'} onClick={() => setTab('daily')} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === 'daily' ? 'bg-brand text-white' : 'text-ink-2 hover:bg-page'}`}>Daily tasks · {VERIFY_QUEUE.length}</button>
          <button type="button" role="tab" aria-selected={tab === 'analysis'} onClick={() => setTab('analysis')} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === 'analysis' ? 'bg-brand text-white' : 'text-ink-2 hover:bg-page'}`}>Test analysis · {toVerify}</button>
        </div>
      </div>
      {tab === 'daily' ? <DailyTab onToast={setToast} /> : <TestRecordsTab onToast={setToast} />}
    </AppShell>
  );
}
