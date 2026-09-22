'use client';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { Button, Card, Pill, StreakFlame } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';

export default function Home() {
  const { brand, labels, challenge } = useSettings();
  const steps = [
    { icon: '🗓', title: `${labels.admin} sets the day`, body: `Day 1 to Day ${challenge.days} planned once, edited any time.` },
    { icon: '🧠', title: `${labels.student} does the task`, body: 'In-app MCQs or pen and paper, with a timer.' },
    { icon: '📈', title: 'Instant analysis', body: 'Score, batch rank band and weakest topics.' },
    { icon: '📸', title: 'Upload proof', body: 'Snap the answer sheet in seconds from the phone.' },
    { icon: '✅', title: `${labels.mentor} verifies`, body: `Task and test marks confirmed. ${labels.points} land.` },
  ];
  const roles = [
    { href: '/login?role=student', icon: '🎓', title: labels.student, body: `Today's task, your ${challenge.days}-day grid, your ${labels.batch.toLowerCase()} rank and nothing else.`, cta: 'Enter with Student ID' },
    { href: '/login?role=parent', icon: '👨‍👩‍👧', title: labels.parent, body: 'Your child\'s day, streak, test marks and average, read-only, updated live.', cta: 'Enter with Student ID' },
    { href: '/login?role=mentor', icon: '🧑‍🏫', title: labels.mentor, body: 'Verify 50 uploads in 15 minutes, confirm test marks, spot who is slipping.', cta: `${labels.mentor} login` },
    { href: '/login?role=admin', icon: '🧭', title: labels.admin, body: 'Plan the challenge, add mentors, read reports, control every rule and label.', cta: `${labels.admin} console` },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-hero text-white relative overflow-hidden">
        <svg className="absolute inset-x-0 bottom-0 w-full h-16 opacity-40 pointer-events-none" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="ecg" d="M0 60 H280 L300 60 L315 22 L330 92 L345 60 H520 L540 60 L555 30 L570 85 L585 60 H820 L840 60 L855 12 L870 96 L885 60 H1200" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <header className="mx-auto max-w-6xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <Logo wordmark light />
          <Button href="/login" variant="light" size="sm">Log in</Button>
        </header>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative">
          <div className="rise">
            <Pill tone="accent" icon="⚕️">The {challenge.days}-day challenge</Pill>
            <h1 className="mt-5 font-display text-4xl sm:text-6xl font-extrabold leading-[1.05]">
              One task a day.
              <br />
              <span className="text-gradient">One mentor who notices.</span>
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              {brand.appName} puts every {labels.student.toLowerCase()} in a {labels.batch.toLowerCase()} of 50 with one {labels.mentor.toLowerCase()}, on a {challenge.days}-day run that starts the day they join. Sundays included.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/login?role=student" variant="accent" size="lg">I&apos;m a {labels.student}</Button>
              <Button href="/login?role=parent" variant="light" size="lg">I&apos;m a {labels.parent}</Button>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
              <li><b className="text-white">{challenge.days}</b> days, Day 1 is your joining day</li>
              <li><b className="text-white">1</b> task every day, Sundays too</li>
              <li><b className="text-white">0</b> passwords for students and parents</li>
            </ul>
          </div>

          <div className="relative h-[420px] hidden sm:block" aria-hidden="true">
            <Card className="absolute left-0 top-4 w-64 rise-2" pad="p-4">
              <div className="flex items-center gap-3">
                <StreakFlame size={56} />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Day 34 of {challenge.days}</div>
                  <div className="font-display text-3xl font-extrabold text-brand-deep leading-none">12-day {labels.streak.toLowerCase()}</div>
                  <div className="text-xs text-ink-2 mt-1">1 freeze banked · 9 to the next milestone</div>
                </div>
              </div>
            </Card>
            <Card className="absolute right-0 top-28 w-72 rise-3" pad="p-4">
              <div className="flex items-center justify-between">
                <Pill tone="brand">Day 34 · Tue 22 Sep</Pill>
                <span className="text-xs text-ink-3 tabular">closes 11:59 PM</span>
              </div>
              <div className="mt-2 font-display font-bold text-brand-deep">Test: Neural Control &amp; Coordination</div>
              <div className="text-xs text-ink-2">20 MCQs · 45 min · paper + upload</div>
              <div className="mt-3 h-2 rounded-full bg-brand-100 overflow-hidden"><div className="h-full w-3/5 bg-brand rounded-full" /></div>
              <div className="mt-1.5 text-[11px] text-ink-3">31 of 47 submitted in your {labels.batch.toLowerCase()}</div>
            </Card>
            <Card className="absolute left-8 bottom-6 w-72 rise-4" pad="p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f7e9] text-[#006300] text-lg">✓</span>
                <div>
                  <div className="text-sm font-bold text-brand-deep">Marks confirmed by Dr. Anjali Rao</div>
                  <div className="text-xs text-ink-2">17/20 · average now 76% · <b className="text-accent-ink">+28 {labels.points}</b></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-10 relative z-10">
        <Card pad="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-brand-deep">The daily loop</h2>
            <p className="text-sm text-ink-2">Five steps, one clear owner each. The {labels.admin.toLowerCase()} plans, the {labels.student.toLowerCase()} works, the {labels.mentor.toLowerCase()} verifies, the {labels.parent.toLowerCase()} watches.</p>
          </div>
          <ol className="grid sm:grid-cols-5 gap-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl bg-page p-4 border border-line">
                <span className="absolute -top-3 left-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-brand-ink text-xs font-bold ring-4 ring-white">{i + 1}</span>
                <div className="text-2xl mt-1" aria-hidden="true">{s.icon}</div>
                <div className="mt-2 font-display font-bold text-brand-deep">{s.title}</div>
                <p className="text-xs text-ink-2 mt-1">{s.body}</p>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <h2 className="font-display text-2xl font-bold text-brand-deep text-center">Four doors, one product</h2>
        <p className="text-sm text-ink-2 text-center mt-1">Each role sees only what it needs. Isolation is enforced in the database, not just hidden in the interface.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {roles.map((r) => (
            <Link key={r.href} href={r.href} className="block">
              <Card lift className="h-full flex flex-col" pad="p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-2xl" aria-hidden="true">{r.icon}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-brand-deep">{r.title}</h3>
                <p className="mt-1.5 text-sm text-ink-2 flex-1">{r.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">{r.cta} <span aria-hidden="true">›</span></span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-3">
          <span>© {new Date().getFullYear()} {brand.appName}. {brand.tagline}</span>
          <span className="flex gap-4">
            <Link href="/teacher" className="hover:text-brand">AI test generator</Link>
            <Link href="/flashcards" className="hover:text-brand">Flashcards</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
