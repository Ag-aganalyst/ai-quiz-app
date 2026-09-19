'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';
import { Button, Card, Field, Pill, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { WEEKDAYS } from '@/lib/brand-defaults';
import { MENTOR } from '@/lib/mock-data';

export default function AssignPage() {
  const router = useRouter();
  const { labels, points: P, schedule, taskTypes } = useSettings();
  const types = [
    { key: 'inApp', icon: '🧠', title: 'In-app test', body: 'MCQs, auto-graded, instant analysis.' },
    { key: 'manual', icon: '📄', title: 'Manual test', body: 'Attach the paper. Student uploads the answer sheet.' },
    { key: 'assignment', icon: '📚', title: 'Assignment', body: 'Reading or notes. Proof upload only.' },
  ].filter((t) => taskTypes[t.key]);
  const [type, setType] = useState(types[0]?.key || 'manual');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [deadline, setDeadline] = useState(schedule.deadline);
  const [duration, setDuration] = useState(45);
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [toast, setToast] = useState('');
  const potential = P.submitOnTime + P.scoreBonusMax + (type === 'inApp' ? 0 : P.uploadProof) + P.verified;

  function publish(e) {
    e.preventDefault();
    setToast('Published. 50 students notified by app, email and WhatsApp.');
    setTimeout(() => router.push('/mentor'), 1400);
  }

  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <h1 className="font-display text-2xl font-bold text-brand-deep mb-1">Assign a {labels.task.toLowerCase()}</h1>
      <p className="text-sm text-ink-2 mb-5">One tap publishes to all 50. Schedule ahead, or save as a template to reuse.</p>

      <form onSubmit={publish} className="grid lg:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-4">
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Task type</div>
            <div className="grid sm:grid-cols-3 gap-2">
              {types.map((t) => (
                <button key={t.key} type="button" onClick={() => setType(t.key)} className={`text-left rounded-xl border p-3 transition ${type === t.key ? 'border-brand bg-brand-soft ring-brand' : 'border-line hover:border-brand-200'}`}>
                  <div className="text-2xl" aria-hidden="true">{t.icon}</div>
                  <div className="font-display font-bold text-brand-deep mt-1">{t.title}</div>
                  <div className="text-xs text-ink-2">{t.body}</div>
                </button>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <Field label="Title"><input className="input" placeholder="e.g. Neural Control & Coordination" value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Subject"><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
              <Field label="Deadline"><input className="input" type="time" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
              <Field label="Expected minutes"><input className="input" type="number" min={5} max={240} value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
            </div>
            <Field label="Instructions"><textarea className="input" rows={3} placeholder="What to do, what to upload, what to skip." /></Field>
            {type !== 'assignment' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="rounded-xl border-2 border-dashed border-line p-4 text-center cursor-pointer hover:border-brand-200">
                  <input type="file" className="hidden" accept=".pdf,image/*" />
                  <div className="text-2xl" aria-hidden="true">📎</div>
                  <div className="text-sm font-semibold text-brand-deep mt-1">{type === 'manual' ? 'Attach the question paper' : 'Attach study material'}</div>
                  <div className="text-xs text-ink-3">PDF or image</div>
                </label>
                <div className="rounded-xl bg-brand-soft border border-brand-100 p-4">
                  <div className="text-sm font-semibold text-brand-deep">✨ Generate questions with AI</div>
                  <p className="text-xs text-ink-2 mt-1">Upload notes, a PDF or a lecture recording and get exam-level MCQs in a minute.</p>
                  <Button href="/teacher" size="sm" variant="secondary" className="mt-2">Open generator</Button>
                </div>
              </div>
            )}
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Repeat on</div>
              <span className="text-xs text-ink-3">Rest days from the {labels.admin.toLowerCase()}&apos;s calendar are greyed out</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => {
                const rest = schedule.restDays.includes(d);
                const on = days.includes(d) && !rest;
                return (
                  <button key={d} type="button" disabled={rest} onClick={() => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]))} className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition ${rest ? 'bg-page text-ink-3 ring-line line-through' : on ? 'bg-brand text-white ring-brand' : 'bg-white text-ink-2 ring-line'}`}>{d}</button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-brand-gradient text-white border-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/70">Preview for students</div>
            <div className="mt-2 flex gap-2"><Pill tone="accent">Today&apos;s {labels.task.toLowerCase()}</Pill><Pill tone="dark">{subject || 'Subject'}</Pill></div>
            <div className="mt-2 font-display text-xl font-bold">{title || 'Untitled task'}</div>
            <div className="text-sm text-white/80">⏱ {duration} min · 🕚 closes {deadline} · 🏅 up to {potential} {labels.points}</div>
          </Card>
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Points this task can earn</div>
            <ul className="mt-2 text-sm space-y-1.5">
              <li className="flex justify-between"><span>On-time submission</span><b>+{P.submitOnTime}</b></li>
              <li className="flex justify-between"><span>Score bonus</span><b>up to +{P.scoreBonusMax}</b></li>
              {type !== 'inApp' && <li className="flex justify-between"><span>Proof upload</span><b>+{P.uploadProof}</b></li>}
              <li className="flex justify-between"><span>Your tick</span><b>+{P.verified}</b></li>
            </ul>
            <p className="text-[11px] text-ink-3 mt-2">Values are set by the {labels.admin.toLowerCase()} in Customise.</p>
          </Card>
          <Button type="submit" size="lg" className="w-full">Publish to 50 students</Button>
          <Button size="lg" variant="secondary" className="w-full" type="button" onClick={() => setToast('Saved as a template.')}>Save as template</Button>
        </div>
      </form>
    </AppShell>
  );
}
