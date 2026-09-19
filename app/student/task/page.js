'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import { Button, Card, Pill, ProgressRing, Stepper, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { MENTOR, STUDENT_ME, TODAY_TASK } from '@/lib/mock-data';

const STAGES = ['Brief', 'Test', 'Analysis', 'Upload', 'Tick'];

export default function StudentTask() {
  const { labels, points: P, schedule } = useSettings();
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [secs, setSecs] = useState(TODAY_TASK.questions.length * 60);
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState('');
  const qs = TODAY_TASK.questions;

  useEffect(() => {
    if (stage !== 1) return undefined;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [stage]);

  const score = useMemo(() => qs.filter((q) => answers[q.id] === q.correct).length, [answers, qs]);
  const pct = Math.round((score / qs.length) * 100);
  const weak = qs.filter((q) => answers[q.id] !== q.correct).map((q) => q.topic);
  const earned = { submit: P.submitOnTime, score: Math.round((pct / 100) * P.scoreBonusMax), upload: P.uploadProof, verify: P.verified };

  function pickFiles(e) {
    const list = Array.from(e.target.files || []).slice(0, 6);
    setFiles(list.map((f) => ({ name: f.name, url: URL.createObjectURL(f), size: f.size })));
  }

  return (
    <AppShell role="student" user={{ name: STUDENT_ME.name, sub: STUDENT_ME.id }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Today&apos;s {labels.task.toLowerCase()} · {TODAY_TASK.subject}</div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">{TODAY_TASK.title}</h1>
        </div>
        <Stepper steps={STAGES} current={stage} />
      </div>

      {stage === 0 && (
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 rise">
          <Card pad="p-6">
            <Pill tone="brand">{TODAY_TASK.typeLabel}</Pill>
            <p className="mt-3 text-ink-2">{TODAY_TASK.description}</p>
            <ol className="mt-5 space-y-3 text-sm">
              <li className="flex gap-3"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">1</span><span><b>Warm-up on screen.</b> Three quick MCQs with a timer, auto-graded, so your analysis starts immediately.</span></li>
              <li className="flex gap-3"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">2</span><span><b>Solve the paper.</b> Download <span className="font-mono text-xs bg-page px-1.5 py-0.5 rounded">{TODAY_TASK.paper}</span>, answer on paper, {TODAY_TASK.durationMin} minutes.</span></li>
              <li className="flex gap-3"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">3</span><span><b>Upload every page.</b> Clear photos, good light. Your {labels.mentor.toLowerCase()} ticks it, then your {labels.points.toLowerCase()} land.</span></li>
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setStage(1)}>Start the warm-up →</Button>
              <Button size="lg" variant="secondary">Download paper</Button>
            </div>
          </Card>
          <Card pad="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">What you can earn today</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>Submit before {schedule.deadline}</span><b className="text-accent-ink">+{P.submitOnTime}</b></li>
              <li className="flex justify-between"><span>Score bonus</span><b className="text-accent-ink">up to +{P.scoreBonusMax}</b></li>
              <li className="flex justify-between"><span>Upload proof</span><b className="text-accent-ink">+{P.uploadProof}</b></li>
              <li className="flex justify-between"><span>{labels.mentor} tick</span><b className="text-accent-ink">+{P.verified}</b></li>
              <li className="flex justify-between"><span>Before {schedule.earlyBird} (early bird)</span><b className="text-accent-ink">+{P.earlyBird}</b></li>
            </ul>
            <div className="mt-4 rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent-ink">🔥 Submitting keeps your <b>{STUDENT_ME.streak}-day</b> {labels.streak.toLowerCase()} alive, even before the tick.</div>
          </Card>
        </div>
      )}

      {stage === 1 && (
        <Card pad="p-6" className="rise">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-ink-2">Question <b className="text-ink">{current + 1}</b> of {qs.length} · <Pill tone="neutral">{qs[current].topic}</Pill></div>
            <div className={`font-display text-xl font-extrabold tabular ${secs < 30 ? 'text-critical' : 'text-brand-deep'}`}>{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</div>
          </div>
          <div className="h-1.5 rounded-full bg-brand-100 overflow-hidden mb-5"><div className="h-full bg-brand rounded-full transition-all" style={{ width: `${((current + 1) / qs.length) * 100}%` }} /></div>
          <p className="text-lg font-semibold text-ink leading-relaxed">{qs[current].question}</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            {qs[current].options.map((o, i) => {
              const chosen = answers[qs[current].id] === i;
              return (
                <button key={o} type="button" onClick={() => setAnswers({ ...answers, [qs[current].id]: i })} className={`text-left rounded-xl border px-4 py-3 text-sm transition ${chosen ? 'border-brand bg-brand-soft ring-brand' : 'border-line bg-white hover:border-brand-200'}`}>
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold mr-2 ${chosen ? 'bg-brand text-white' : 'bg-page text-ink-2'}`}>{'ABCD'[i]}</span>
                  {o}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)}>← Previous</Button>
            {current < qs.length - 1 ? (
              <Button onClick={() => setCurrent(current + 1)}>Next →</Button>
            ) : (
              <Button variant="accent" onClick={() => { setStage(2); setToast(`Submitted. +${P.submitOnTime} ${labels.points} and your streak is safe.`); }}>Submit test</Button>
            )}
          </div>
        </Card>
      )}

      {stage === 2 && (
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4 rise">
          <div className="space-y-4">
            <Card className="text-center" pad="p-6">
              <ProgressRing value={pct / 100} size={140} stroke={12} color={pct >= 70 ? 'var(--brand)' : 'var(--warn)'}>
                <span className="leading-tight"><span className="block font-display text-4xl font-extrabold text-brand-deep">{pct}%</span><span className="block text-xs text-ink-3">{score} of {qs.length} correct</span></span>
              </ProgressRing>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-page p-2"><div className="text-[10px] uppercase font-semibold text-ink-3">{labels.batch} rank</div><div className="font-display font-bold text-brand-deep">Top 20%</div></div>
                <div className="rounded-xl bg-page p-2"><div className="text-[10px] uppercase font-semibold text-ink-3">{labels.batch} avg</div><div className="font-display font-bold text-brand-deep">61%</div></div>
                <div className="rounded-xl bg-page p-2"><div className="text-[10px] uppercase font-semibold text-ink-3">Percentile</div><div className="font-display font-bold text-brand-deep">82</div></div>
              </div>
              <div className="mt-4 rounded-xl bg-brand-soft border border-brand-100 p-3 text-sm text-brand-700 text-left">
                <b>AI summary.</b> {weak.length ? `You lost marks on ${weak.join(' and ')}. Re-read the mechanism, then retry these in your mistake notebook tonight.` : 'Clean sweep. Push difficulty up tomorrow.'}
              </div>
            </Card>
            <Button size="lg" className="w-full" onClick={() => setStage(3)}>Now upload your paper →</Button>
          </div>
          <Card pad="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3">Question review</div>
            <ul className="space-y-3">
              {qs.map((q, i) => {
                const ok = answers[q.id] === q.correct;
                return (
                  <li key={q.id} className={`rounded-xl border p-3 ${ok ? 'border-[#bfe6bf] bg-[#f3fbf3]' : 'border-[#f2b8b8] bg-[#fff5f5]'}`}>
                    <div className="flex items-start gap-2 text-sm">
                      <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${ok ? 'bg-good text-white' : 'bg-critical text-white'}`}>{ok ? '✓' : '✕'}</span>
                      <span><b>Q{i + 1}.</b> {q.question}</span>
                    </div>
                    <div className="mt-1.5 text-xs text-ink-2 pl-7">Correct: <b>{'ABCD'[q.correct]}</b> · {q.explanation}</div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}

      {stage === 3 && (
        <div className="grid lg:grid-cols-[1fr_0.8fr] gap-4 rise">
          <Card pad="p-6">
            <div className="text-sm text-ink-2">Upload a photo of every page. Good light, flat page, all four corners visible.</div>
            <label className="mt-4 block cursor-pointer rounded-2xl border-2 border-dashed border-brand-200 bg-brand-soft p-8 text-center hover:border-brand transition">
              <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={pickFiles} />
              <div className="text-4xl" aria-hidden="true">📸</div>
              <div className="mt-2 font-display font-bold text-brand-deep">Tap to open the camera</div>
              <div className="text-xs text-ink-3 mt-1">or choose from gallery · up to 6 pages · auto-compressed</div>
            </label>
            {files.length > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-2">
                {files.map((f, i) => (
                  <li key={f.url} className="relative rounded-xl overflow-hidden border border-line aspect-[3/4] bg-page">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-brand-deep/85 text-white text-[10px] font-bold px-1.5 py-0.5">Page {i + 1}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-ink-3">{files.length ? `${files.length} page${files.length > 1 ? 's' : ''} ready` : 'No pages yet'}</span>
              <Button variant="accent" size="lg" disabled={!files.length} onClick={() => { setStage(4); setToast(`Uploaded. +${P.uploadProof} ${labels.points}. Waiting for ${MENTOR.name.split(' ')[0]}'s tick.`); }}>Submit proof</Button>
            </div>
            <button type="button" className="mt-3 text-xs text-ink-3 hover:text-brand underline-offset-2 hover:underline" onClick={() => { setFiles([{ name: 'demo', url: '', size: 0 }]); }}>No camera here? Use a demo page</button>
          </Card>
          <Card pad="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Before you upload</div>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              <li>✅ Your name and Student ID written on page 1</li>
              <li>✅ Question numbers visible next to each answer</li>
              <li>✅ Steps shown for numericals, not just the final answer</li>
              <li>💡 The AI pre-check flags blur or a wrong-task upload before your {labels.mentor.toLowerCase()} sees it.</li>
            </ul>
          </Card>
        </div>
      )}

      {stage === 4 && (
        <div className="grid lg:grid-cols-[1fr_0.8fr] gap-4 rise">
          <Card pad="p-8" className="text-center">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-4xl">⏳</div>
            <h2 className="mt-4 font-display text-2xl font-bold text-brand-deep">Done for today. Nice.</h2>
            <p className="text-ink-2 mt-1">Your {labels.streak.toLowerCase()} is now <b className="text-accent-ink">{STUDENT_ME.streak + 1} days</b>. {MENTOR.name} usually ticks within 6 hours.</p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="rounded-xl bg-[#f3fbf3] border border-[#bfe6bf] p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Submitted</div><div className="font-bold text-[#006300]">+{earned.submit}</div></div>
              <div className="rounded-xl bg-[#f3fbf3] border border-[#bfe6bf] p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Score</div><div className="font-bold text-[#006300]">+{earned.score}</div></div>
              <div className="rounded-xl bg-[#f3fbf3] border border-[#bfe6bf] p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Proof</div><div className="font-bold text-[#006300]">+{earned.upload}</div></div>
              <div className="rounded-xl bg-page border border-dashed border-line p-3"><div className="text-[10px] uppercase font-semibold text-ink-3">Tick</div><div className="font-bold text-ink-3">+{earned.verify} pending</div></div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/student" size="lg">Back home</Button>
              <Button variant="secondary" size="lg" onClick={() => { setStage(0); setAnswers({}); setCurrent(0); setSecs(qs.length * 60); setFiles([]); }}>Replay the demo</Button>
            </div>
          </Card>
          <Card pad="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Tonight&apos;s revision</div>
            <ul className="mt-3 space-y-2">
              {(weak.length ? weak : ['Saltatory conduction']).map((t) => (
                <li key={t} className="flex items-center justify-between rounded-xl bg-page px-3 py-2 text-sm"><span>{t}</span><Pill tone="warn">retry 3 Qs</Pill></li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-3">Tomorrow&apos;s in-app test will lean toward these topics.</p>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
