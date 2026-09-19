'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Button, Field, Pill, StreakFlame } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';

function LoginInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { brand, labels } = useSettings();
  const initial = ['student', 'mentor', 'admin'].includes(params.get('role')) ? params.get('role') : 'student';
  const [role, setRole] = useState(initial);
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const tabs = [
    { key: 'student', label: labels.student },
    { key: 'mentor', label: labels.mentor },
    { key: 'admin', label: labels.admin },
  ];

  function go(path) {
    setBusy(true);
    setTimeout(() => router.push(path), 500);
  }

  function submit(e) {
    e.preventDefault();
    if (role === 'student') {
      if (step === 1) return setStep(2);
      return go('/student');
    }
    if (role === 'mentor') return go('/mentor');
    if (step === 1) return setStep(2);
    return go('/admin');
  }

  function switchRole(r) {
    setRole(r);
    setStep(1);
    setOtp('');
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr]">
      <aside className="bg-hero text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <Logo wordmark light size="lg" />
        <div className="relative my-10">
          <div className="flex items-center gap-4">
            <StreakFlame size={72} />
            <div>
              <div className="text-xs uppercase tracking-wide text-white/60 font-semibold">Riya, {labels.batch} A</div>
              <div className="font-display text-3xl font-extrabold">12-day {labels.streak.toLowerCase()}</div>
            </div>
          </div>
          <blockquote className="mt-8 text-lg text-white/85 max-w-md leading-relaxed">
            “I stopped studying for marks and started studying so the flame doesn&apos;t go out. My mentor noticed before I did.”
          </blockquote>
          <div className="mt-3 text-sm text-white/60">A {labels.student.toLowerCase()} at {brand.appName}</div>
        </div>
        <ul className="text-sm text-white/70 space-y-1.5">
          <li>• {labels.student}s never set a password. A Student ID and a 6-digit code by email is all it takes.</li>
          <li>• {labels.mentor}s enrol their {labels.batch.toLowerCase()} from one Excel sheet.</li>
          <li>• The {labels.admin.toLowerCase()} can rename, recolour and re-rule everything.</li>
        </ul>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-md rise">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-bold text-brand-deep">Welcome back</h1>
            <Pill tone="neutral">Demo mode</Pill>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-page p-1 border border-line mb-6" role="tablist">
            {tabs.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={role === t.key} onClick={() => switchRole(t.key)} className={`rounded-xl py-2 text-sm font-semibold transition ${role === t.key ? 'bg-white text-brand-deep shadow-sm' : 'text-ink-2 hover:text-brand-deep'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {role === 'student' && step === 1 && (
            <div className="space-y-4">
              <Field label="Student ID" hint="It was emailed to you by your mentor. Example: BM-26-0143">
                <input className="input font-display tracking-widest uppercase" placeholder="BM-26-____" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())} autoFocus />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>Send code to my email</Button>
              <p className="text-xs text-ink-3 text-center">No password. Ever.</p>
            </div>
          )}
          {role === 'student' && step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-brand-soft border border-brand-100 px-4 py-3 text-sm text-brand-700">
                We sent a 6-digit code to the email on file for <b>{studentId || 'BM-26-0143'}</b>. Codes expire in 10 minutes.
              </div>
              <Field label="6-digit code">
                <input className="input font-display text-2xl tracking-[0.6em] text-center" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? 'Opening your day…' : 'Log in'}</Button>
              <div className="flex justify-between text-xs text-ink-3">
                <button type="button" className="hover:text-brand" onClick={() => setStep(1)}>Wrong ID?</button>
                <button type="button" className="hover:text-brand">Resend code</button>
              </div>
            </div>
          )}

          {role === 'mentor' && (
            <div className="space-y-4">
              <Field label="Email">
                <input className="input" type="email" placeholder="you@brainymedia.in" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </Field>
              <Field label="Password">
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? 'Opening your batch…' : `Open ${labels.mentor.toLowerCase()} dashboard`}</Button>
              <p className="text-xs text-ink-3 text-center">Forgot it? Use the email code instead.</p>
            </div>
          )}

          {role === 'admin' && step === 1 && (
            <div className="space-y-4">
              <Field label="Email">
                <input className="input" type="email" placeholder="owner@brainymedia.in" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </Field>
              <Field label="Password">
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Button type="submit" size="lg" variant="dark" className="w-full" disabled={busy}>Continue</Button>
              <p className="text-xs text-ink-3 text-center">The {labels.admin.toLowerCase()} account always asks for a second code.</p>
            </div>
          )}
          {role === 'admin' && step === 2 && (
            <div className="space-y-4">
              <Field label="Second factor code" hint="Sent to your email">
                <input className="input font-display text-2xl tracking-[0.6em] text-center" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus />
              </Field>
              <Button type="submit" size="lg" variant="dark" className="w-full" disabled={busy}>{busy ? 'Opening console…' : `Open ${labels.admin.toLowerCase()} console`}</Button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginInner />
    </Suspense>
  );
}
