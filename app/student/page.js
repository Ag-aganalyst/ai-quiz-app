'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import Sparkline from '@/components/viz/Sparkline';
import { Avatar, Button, Card, Pill, ProgressRing, SectionTitle, StreakFlame } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { levelFor } from '@/lib/brand-defaults';
import { LEADERBOARD, MENTOR, STUDENT_ME, TODAY_TASK } from '@/lib/mock-data';

function useCountdown(deadline) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => {
      const [h, m] = (deadline || '23:59').split(':').map(Number);
      const end = new Date();
      end.setHours(h, m, 59, 0);
      const ms = Math.max(0, end.getTime() - Date.now());
      setLeft({ h: Math.floor(ms / 3.6e6), m: Math.floor((ms % 3.6e6) / 6e4), s: Math.floor((ms % 6e4) / 1e3) });
    };
    const t0 = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [deadline]);
  return left;
}

export default function StudentHome() {
  const { labels, schedule, levels, points: P, streak: S } = useSettings();
  const me = STUDENT_ME;
  const left = useCountdown(schedule.deadline);
  const { current, next } = levelFor(me.points, levels);
  const levelProgress = next ? (me.points - current.min) / (next.min - current.min) : 1;
  const milestones = S.milestones.split(',').map((x) => parseInt(x, 10)).filter(Boolean);
  const nextMilestone = milestones.find((m) => m > me.streak) || milestones[milestones.length - 1];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const taskPotential = P.submitOnTime + P.scoreBonusMax + P.uploadProof + P.verified;

  return (
    <AppShell role="student" user={{ name: me.name, sub: me.id }}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 rise">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-deep">{greet}, {me.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-ink-2">Your {labels.mentor.toLowerCase()} <b className="text-ink">{MENTOR.name}</b> · {MENTOR.batch} · {labels.student} ID <span className="font-mono">{me.id}</span></p>
        </div>
        <Pill tone="accent" icon="🏅">{current.name}</Pill>
      </div>

      <div className="grid md:grid-cols-3 gap-4 rise-2">
        <Card className="flex items-center gap-4 overflow-hidden relative" pad="p-5">
          <StreakFlame size={72} dim={me.streak === 0} />
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{labels.streak}</div>
            <div className="font-display text-4xl font-extrabold text-brand-deep leading-none">{me.streak} <span className="text-lg font-bold text-ink-2">days</span></div>
            <div className="text-xs text-ink-2 mt-1.5">{nextMilestone - me.streak} more to the {nextMilestone}-day milestone</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Pill tone="brand" icon="🧊">{me.freezes} freeze{me.freezes === 1 ? '' : 's'} banked</Pill>
              <span className="text-ink-3">best {me.bestStreak}</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4" pad="p-5">
          <ProgressRing value={levelProgress} size={88} stroke={9} color="var(--accent)" track="var(--accent-soft)">
            <span className="text-center leading-tight">
              <span className="block font-display text-xl font-extrabold text-brand-deep">{Math.round(levelProgress * 100)}%</span>
              <span className="block text-[10px] text-ink-3">to {next ? next.name : 'max'}</span>
            </span>
          </ProgressRing>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{labels.points}</div>
            <div className="font-display text-4xl font-extrabold text-brand-deep leading-none">{me.points.toLocaleString('en-IN')}</div>
            <div className="text-xs text-ink-2 mt-1.5">{next ? `${(next.min - me.points).toLocaleString('en-IN')} to ${next.name}` : 'Top level reached'}</div>
          </div>
        </Card>

        <Card className="bg-brand-gradient text-white border-0" pad="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/70">{labels.batch} rank</span>
            <span className="text-xs text-white/70">this week</span>
          </div>
          <div className="font-display text-4xl font-extrabold leading-none mt-1">{me.rankBand}</div>
          <div className="text-xs text-white/80 mt-1.5">Ranks below 10 show as a band, so you race yourself first.</div>
          <div className="mt-3 flex items-center gap-3">
            <Sparkline values={me.weekly} width={120} height={36} color="#fff" accent="var(--accent)" />
            <span className="text-sm"><b>{me.weekly[me.weekly.length - 1]}%</b> <span className="text-white/70">last score</span></span>
          </div>
        </Card>
      </div>

      <Card className="mt-4 rise-3 relative overflow-hidden" pad="p-0">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent-soft/70 blur-2xl" aria-hidden="true" />
        <div className="p-5 sm:p-6 grid md:grid-cols-[1fr_auto] gap-5 items-center relative">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="accent" icon="🎯">Today&apos;s {labels.task.toLowerCase()}</Pill>
              <Pill tone="neutral">{TODAY_TASK.subject}</Pill>
              <Pill tone="brand">{TODAY_TASK.typeLabel}</Pill>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-brand-deep">{TODAY_TASK.title}</h2>
            <p className="text-sm text-ink-2 mt-1 max-w-2xl">{TODAY_TASK.description}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
              <li>⏱ {TODAY_TASK.durationMin} min</li>
              <li>🏅 up to <b className="text-accent-ink">{taskPotential} {labels.points}</b></li>
              <li>🕚 closes {schedule.deadline}</li>
            </ul>
          </div>
          <div className="text-center md:text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Time left</div>
            <div className="font-display text-3xl font-extrabold text-brand-deep tabular">
              {left ? `${String(left.h).padStart(2, '0')}:${String(left.m).padStart(2, '0')}:${String(left.s).padStart(2, '0')}` : '--:--:--'}
            </div>
            <Button href="/student/task" size="lg" className="mt-3 w-full md:w-auto">Start now →</Button>
          </div>
        </div>
        <div className="border-t border-line bg-page px-5 sm:px-6 py-2.5 text-xs text-ink-2 flex flex-wrap gap-x-6 gap-y-1">
          <span>Step 1 · Test</span><span>Step 2 · Analysis</span><span>Step 3 · Upload proof</span><span>Step 4 · {labels.mentor} tick</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 mt-6 rise-4">
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Your week" subtitle="Scores on the last seven tasks" />
            <div className="flex items-center gap-5">
              <Sparkline values={me.weekly} width={260} height={64} />
              <div className="text-sm">
                <div className="text-ink-3 text-xs uppercase font-semibold tracking-wide">Weakest topics</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {me.weakTopics.map((t) => <Pill key={t} tone="warn" icon="⚠️">{t}</Pill>)}
                </div>
                <p className="mt-2 text-xs text-ink-2">Revise these before tomorrow. Your mistake notebook has <b>{me.mistakes}</b> questions to retry.</p>
              </div>
            </div>
          </Card>
          <Card>
            <SectionTitle title="Badges" subtitle="Earned by doing, not by luck" />
            <ul className="grid grid-cols-5 gap-2">
              {me.badges.map((b) => (
                <li key={b.name} className={`rounded-xl border p-2 text-center ${b.earned ? 'border-accent bg-accent-soft' : 'border-line bg-page opacity-60'}`}>
                  <div className="text-2xl" aria-hidden="true">{b.icon}</div>
                  <div className="text-[10px] font-semibold text-ink-2 mt-1 leading-tight">{b.name}</div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionTitle title={`${labels.points} ledger`} subtitle="Every point, and why" />
            <ul className="divide-y divide-line text-sm">
              {me.ledger.map((l, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span><span className="text-ink-3 text-xs mr-2">{l.when}</span>{l.what}</span>
                  <span className="font-bold text-accent-ink tabular">+{l.pts}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card id="leaderboard">
            <SectionTitle title={`${MENTOR.batch} leaderboard`} subtitle="Weekly · only your batch, always" />
            <ol className="space-y-1.5">
              {LEADERBOARD.map((r) => (
                <li key={r.rank} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${r.rank <= 3 ? 'bg-accent-soft' : 'bg-page'}`}>
                  <span className={`w-6 text-center font-display font-extrabold ${r.rank <= 3 ? 'text-accent-ink' : 'text-ink-3'}`}>{r.rank}</span>
                  <Avatar name={r.name} size="sm" />
                  <span className="flex-1 text-sm font-semibold text-ink truncate">{r.name}</span>
                  <span className="text-xs text-ink-3">🔥 {r.streak}</span>
                  <span className="text-sm font-bold text-brand-deep tabular">{r.points.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-xl border border-dashed border-brand-200 bg-brand-soft px-3 py-2 text-sm text-brand-700">
              You: <b>{me.rankBand}</b> · {me.points.toLocaleString('en-IN')} pts · keep the streak to climb.
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <Avatar name={MENTOR.name} size="lg" />
            <div className="flex-1">
              <div className="font-display font-bold text-brand-deep">{MENTOR.name}</div>
              <div className="text-xs text-ink-2">Your {labels.mentor.toLowerCase()} · verifies within ~6 hours · 🔥 {MENTOR.streak}-day mentor streak</div>
            </div>
            <Button variant="secondary" size="sm">Ask a doubt</Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
