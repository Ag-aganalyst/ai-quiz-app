'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';
import { Button, Card, Field, Pill, StreakFlame, Toast, Toggle } from '@/components/ui';
import { getSettings, resetSettings, setSettings, updateSettings, useSettings } from '@/lib/settings-store';
import { DEFAULT_SETTINGS, WEEKDAYS, fillTemplate } from '@/lib/brand-defaults';
import { isValidHex } from '@/lib/color';

const TABS = [
  { key: 'brand', label: 'Branding', icon: '🎨' },
  { key: 'labels', label: 'Labels', icon: '🏷️' },
  { key: 'points', label: 'Points', icon: '🏅' },
  { key: 'streak', label: 'Streaks', icon: '🔥' },
  { key: 'schedule', label: 'Schedule', icon: '🗓' },
  { key: 'features', label: 'Features', icon: '🧩' },
  { key: 'messages', label: 'Messages', icon: '✉️' },
];

const PRESETS = [
  { name: 'BNM teal', primary: '#2a8d78', primaryDeep: '#0f3d34', accent: '#f5d020' },
  { name: 'Ocean', primary: '#2a78d6', primaryDeep: '#0f2a4d', accent: '#ffb84d' },
  { name: 'Plum', primary: '#7c4dcc', primaryDeep: '#2c1a4d', accent: '#ffd166' },
  { name: 'Ember', primary: '#d9572b', primaryDeep: '#3d1a0f', accent: '#ffd23f' },
];

const POINT_ROWS = [
  ['submitOnTime', 'Submit before the deadline'],
  ['scoreBonusMax', 'Score bonus (maximum, proportional to %)'],
  ['uploadProof', 'Upload proof'],
  ['verified', 'Mentor verifies'],
  ['earlyBird', 'Early bird (before the early-bird time)'],
  ['rank1', 'Rank 1 in the batch for the day'],
  ['rank2', 'Rank 2'],
  ['rank3', 'Rank 3'],
  ['perfectWeek', 'Perfect week'],
  ['milestone7', '7-day streak milestone'],
  ['milestone21', '21-day streak milestone'],
  ['milestone45', '45-day streak milestone'],
  ['milestone90', '90-day streak milestone'],
];

function ColorRow({ label, value, onChange, hint }) {
  const ok = isValidHex(value);
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={ok ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 rounded-lg border border-line cursor-pointer bg-white p-0.5" aria-label={`${label} colour`} />
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-ink-3">{hint}</div>
      </div>
      <input className={`input w-32 font-mono text-sm ${ok ? '' : 'border-critical'}`} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SettingsInner() {
  const params = useSearchParams();
  const s = useSettings();
  const initial = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'brand';
  const [tab, setTab] = useState(initial);
  const [toast, setToast] = useState('');
  const set = (patch) => updateSettings(patch);

  function onLogo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 400 * 1024) {
      setToast('Logo is over 400 KB. Please compress it first.');
      return;
    }
    const r = new FileReader();
    r.onload = () => set({ brand: { logoUrl: String(r.result) } });
    r.readAsDataURL(f);
  }

  function exportJson() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(getSettings(), null, 2)], { type: 'application/json' }));
    a.download = 'brainy-media-settings.json';
    a.click();
  }

  function importJson(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => {
      try {
        setSettings(JSON.parse(t));
        setToast('Settings imported.');
      } catch {
        setToast('That file is not valid JSON.');
      }
    });
  }

  const sample = { name: 'Riya', app: s.brand.appName, id: 'BM-26-0143', mentor: 'Dr. Anjali Rao', link: 'https://app.brainymedia.in/l/abc', deadline: s.schedule.deadline, streak: 12, points: 28, pointsName: s.labels.points };

  return (
    <AppShell role="admin" user={{ name: s.labels.admin, sub: s.brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">Customise {s.brand.appName}</h1>
          <p className="text-sm text-ink-2">Everything here changes the live product for every role. Changes save automatically.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={exportJson}>Export JSON</Button>
          <label className="inline-flex"><input type="file" accept="application/json" className="hidden" onChange={importJson} /><span className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-deep hover:bg-brand-soft cursor-pointer">Import JSON</span></label>
          <Button variant="secondary" size="sm" onClick={() => { if (window.confirm('Reset every setting to the defaults?')) { resetSettings(); setToast('Back to defaults.'); } }}>Reset</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-4">
        <nav className="flex lg:flex-col gap-1 overflow-auto" aria-label="Settings sections">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap transition ${tab === t.key ? 'bg-brand text-white' : 'text-ink-2 hover:bg-white'}`}>
              <span aria-hidden="true">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {tab === 'brand' && (
            <>
              <Card className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="App name"><input className="input" value={s.brand.appName} onChange={(e) => set({ brand: { appName: e.target.value } })} /></Field>
                  <Field label="Short name"><input className="input" value={s.brand.shortName} onChange={(e) => set({ brand: { shortName: e.target.value } })} /></Field>
                </div>
                <Field label="Tagline"><input className="input" value={s.brand.tagline} onChange={(e) => set({ brand: { tagline: e.target.value } })} /></Field>
                <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
                  <Field label="Logo" hint="PNG or SVG, under 400 KB. Shown on a white chip so it works on dark headers too.">
                    <input className="input" value={s.brand.logoUrl.startsWith('data:') ? '(uploaded file)' : s.brand.logoUrl} onChange={(e) => set({ brand: { logoUrl: e.target.value } })} />
                  </Field>
                  <label className="inline-flex"><input type="file" accept="image/*" className="hidden" onChange={onLogo} /><span className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep hover:bg-brand-soft cursor-pointer">Upload</span></label>
                </div>
              </Card>
              <Card className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">Colour theme</div>
                  <div className="flex gap-1.5">
                    {PRESETS.map((p) => (
                      <button key={p.name} type="button" onClick={() => set({ brand: { primary: p.primary, primaryDeep: p.primaryDeep, accent: p.accent } })} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold hover:border-brand-200" title={p.name}>
                        <span className="h-3 w-3 rounded-full" style={{ background: p.primary }} /><span className="h-3 w-3 rounded-full" style={{ background: p.accent }} />{p.name}
                      </button>
                    ))}
                  </div>
                </div>
                <ColorRow label="Primary" hint="Buttons, links, progress. Taken from the BNM teal." value={s.brand.primary} onChange={(v) => set({ brand: { primary: v } })} />
                <ColorRow label="Deep" hint="Headers and hero backgrounds." value={s.brand.primaryDeep} onChange={(v) => set({ brand: { primaryDeep: v } })} />
                <ColorRow label="Accent" hint="Streak flame, highlights, points. The caduceus gold." value={s.brand.accent} onChange={(v) => set({ brand: { accent: v } })} />
                <Field label={`Corner radius · ${s.brand.radius}px`}>
                  <input type="range" min={8} max={28} value={s.brand.radius} onChange={(e) => set({ brand: { radius: Number(e.target.value) } })} className="w-full accent-[var(--brand)]" />
                </Field>
              </Card>
              <Card>
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3">Live preview</div>
                <div className="rounded-2xl overflow-hidden border border-line">
                  <div className="bg-brand-gradient text-white px-4 py-3 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-lg bg-white px-2 py-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.brand.logoUrl} alt="" className="h-6 w-auto" />
                    </span>
                    <span className="font-display font-bold">{s.brand.appName}</span>
                    <Pill tone="accent" className="ml-auto">{s.labels.student} console</Pill>
                  </div>
                  <div className="p-4 bg-page grid sm:grid-cols-2 gap-3">
                    <div className="card p-4 flex items-center gap-3">
                      <StreakFlame size={48} />
                      <div><div className="text-[10px] uppercase font-semibold text-ink-3">{s.labels.streak}</div><div className="font-display text-2xl font-extrabold text-brand-deep leading-none">12 days</div></div>
                    </div>
                    <div className="card p-4">
                      <Pill tone="brand">Today&apos;s {s.labels.task.toLowerCase()}</Pill>
                      <div className="mt-2 font-display font-bold text-brand-deep">Neural Control</div>
                      <Button size="sm" className="mt-2">Start now →</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {tab === 'labels' && (
            <Card className="space-y-4">
              <p className="text-sm text-ink-2">Rename the words the product uses. Prefer &quot;Coach&quot; over &quot;Mentor&quot;? &quot;Guardian&quot; over &quot;Parent&quot;? Change it once, it changes everywhere.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(s.labels).map(([k, v]) => (
                  <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)}`} hint={`Default: ${DEFAULT_SETTINGS.labels[k]}`}>
                    <input className="input" value={v} onChange={(e) => set({ labels: { [k]: e.target.value } })} />
                  </Field>
                ))}
              </div>
              <div className="rounded-xl bg-brand-soft border border-brand-100 p-3 text-sm text-brand-700">
                Preview: &quot;Your {s.labels.mentor.toLowerCase()} assigned today&apos;s {s.labels.task.toLowerCase()} to {s.labels.batch} A. Submit to keep your {s.labels.streak.toLowerCase()} and earn {s.labels.points}.&quot;
              </div>
            </Card>
          )}

          {tab === 'points' && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-ink-2">Every value in the economy. A normal task can earn up to <b className="text-accent-ink">{s.points.submitOnTime + s.points.scoreBonusMax + s.points.uploadProof + s.points.verified} {s.labels.points}</b>.</div>
                <Button size="sm" variant="ghost" onClick={() => set({ points: DEFAULT_SETTINGS.points })}>Defaults</Button>
              </div>
              <ul className="divide-y divide-line">
                {POINT_ROWS.map(([k, label]) => (
                  <li key={k} className="flex items-center justify-between gap-4 py-2">
                    <span className="text-sm">{label}</span>
                    <input type="number" min={0} className="input w-24 text-right tabular" value={s.points[k]} onChange={(e) => set({ points: { [k]: Number(e.target.value) } })} />
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-3">Levels</div>
              <ul className="mt-2 grid sm:grid-cols-5 gap-2">
                {s.levels.map((l, i) => (
                  <li key={i} className="rounded-xl border border-line p-2">
                    <input className="input mb-1 text-sm font-semibold" value={l.name} onChange={(e) => set({ levels: s.levels.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                    <input className="input text-xs tabular" type="number" value={l.min} onChange={(e) => set({ levels: s.levels.map((x, j) => (j === i ? { ...x, min: Number(e.target.value) } : x)) })} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {tab === 'streak' && (
            <Card className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label={`${s.labels.challenge} length (days)`} hint="Every student runs Day 1 to Day N from their joining date"><input className="input" type="number" min={7} max={365} value={s.challenge.days} onChange={(e) => set({ challenge: { days: Number(e.target.value) } })} /></Field>
                <Field label="Revision day every (days)" hint="Lighter day, e.g. every 7th"><input className="input" type="number" min={0} value={s.challenge.revisionEvery} onChange={(e) => set({ challenge: { revisionEvery: Number(e.target.value) } })} /></Field>
                <Field label="Max items per day"><input className="input" type="number" min={1} max={4} value={s.challenge.maxItemsPerDay} onChange={(e) => set({ challenge: { maxItemsPerDay: Number(e.target.value) } })} /></Field>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">A streak day counts on</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[['submission', 'Submission before the deadline', 'Recommended. A slow mentor never breaks a student\'s streak.'], ['verification', 'Mentor verification', 'Stricter. Students depend on how fast mentors tick.']].map(([v, t, h]) => (
                    <button key={v} type="button" onClick={() => set({ streak: { countsOn: v } })} className={`text-left rounded-xl border p-3 ${s.streak.countsOn === v ? 'border-brand bg-brand-soft ring-brand' : 'border-line'}`}>
                      <div className="font-semibold text-sm">{t}</div><div className="text-xs text-ink-2">{h}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Earn a freeze every (days)"><input className="input" type="number" min={1} value={s.streak.freezeEveryDays} onChange={(e) => set({ streak: { freezeEveryDays: Number(e.target.value) } })} /></Field>
                <Field label="Max freezes banked"><input className="input" type="number" min={0} value={s.streak.freezeCap} onChange={(e) => set({ streak: { freezeCap: Number(e.target.value) } })} /></Field>
                <Field label="Comeback restores (%)"><input className="input" type="number" min={0} max={100} value={s.streak.comebackRestorePercent} onChange={(e) => set({ streak: { comebackRestorePercent: Number(e.target.value) } })} /></Field>
                <Field label="Late window (hours after deadline)"><input className="input" type="number" min={0} max={24} value={s.streak.lateWindowHours} onChange={(e) => set({ streak: { lateWindowHours: Number(e.target.value) } })} /></Field>
                <Field label="Late credit">
                  <select className="input" value={s.streak.lateCredit} onChange={(e) => set({ streak: { lateCredit: e.target.value } })}>
                    <option value="half">Half points, no streak</option>
                    <option value="none">No points, no streak</option>
                  </select>
                </Field>
                <Field label="Milestones (days)" hint="Comma separated"><input className="input" value={s.streak.milestones} onChange={(e) => set({ streak: { milestones: e.target.value } })} /></Field>
              </div>
            </Card>
          )}

          {tab === 'schedule' && (
            <Card className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Daily deadline"><input className="input" type="time" value={s.schedule.deadline} onChange={(e) => set({ schedule: { deadline: e.target.value } })} /></Field>
                <Field label="Mentors must publish by"><input className="input" type="time" value={s.schedule.publishBy} onChange={(e) => set({ schedule: { publishBy: e.target.value } })} /></Field>
                <Field label="Early-bird cut-off"><input className="input" type="time" value={s.schedule.earlyBird} onChange={(e) => set({ schedule: { earlyBird: e.target.value } })} /></Field>
                <Field label="Timezone">
                  <select className="input" value={s.schedule.timezone} onChange={(e) => set({ schedule: { timezone: e.target.value } })}>
                    {['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'UTC'].map((z) => <option key={z}>{z}</option>)}
                  </select>
                </Field>
                <Field label={`Seats per ${s.labels.mentor.toLowerCase()}`}><input className="input" type="number" min={1} max={500} value={s.schedule.seatsPerMentor} onChange={(e) => set({ schedule: { seatsPerMentor: Number(e.target.value) } })} /></Field>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Rest days (streaks are safe, no task expected). None by default: Sundays count in the {s.challenge.days}-day {s.labels.challenge.toLowerCase()}.</div>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d) => {
                    const on = s.schedule.restDays.includes(d);
                    return <button key={d} type="button" onClick={() => set({ schedule: { restDays: on ? s.schedule.restDays.filter((x) => x !== d) : [...s.schedule.restDays, d] } })} className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${on ? 'bg-brand text-white ring-brand' : 'bg-white text-ink-2 ring-line'}`}>{d}</button>;
                  })}
                </div>
                <p className="text-xs text-ink-3 mt-2">Holidays: add specific dates in the calendar (coming in phase 2).</p>
              </div>
            </Card>
          )}

          {tab === 'features' && (
            <>
              <Card>
                <div className="text-sm font-semibold mb-1">Task types mentors can assign</div>
                <Toggle label="In-app test" hint="MCQs, auto-graded, instant analysis" checked={s.taskTypes.inApp} onChange={(v) => set({ taskTypes: { inApp: v } })} />
                <Toggle label="Manual test" hint="Paper attached, answer sheet uploaded" checked={s.taskTypes.manual} onChange={(v) => set({ taskTypes: { manual: v } })} />
                <Toggle label="Assignment" hint="Reading or notes, proof upload only" checked={s.taskTypes.assignment} onChange={(v) => set({ taskTypes: { assignment: v } })} />
              </Card>
              <Card>
                <div className="text-sm font-semibold mb-1">Features</div>
                <Toggle label="WhatsApp messages" hint="Welcome, reminders and nudges also go to the phone number from the mentor's sheet" checked={s.features.whatsapp} onChange={(v) => set({ features: { whatsapp: v } })} />
                <Toggle label="AI verification assist" hint="Flags blurry pages and wrong-task uploads before the mentor sees them" checked={s.features.aiVerify} onChange={(v) => set({ features: { aiVerify: v } })} />
                <Toggle label="Doubt threads" hint="One thread per task, answered once for the whole batch" checked={s.features.doubtThreads} onChange={(v) => set({ features: { doubtThreads: v } })} />
                <Toggle label="Teams within a batch" hint="Five teams of ten with a weekly team completion rate" checked={s.features.teams} onChange={(v) => set({ features: { teams: v } })} />
                <Toggle label="Seasons" hint="Quarterly leaderboard reset with a hall of fame" checked={s.features.seasons} onChange={(v) => set({ features: { seasons: v } })} />
                <Toggle label="Rewards catalogue" hint="Students redeem points for certificates, sessions and freezes" checked={s.features.rewards} onChange={(v) => set({ features: { rewards: v } })} />
                <Toggle label="Parent digest" hint="Weekly summary email, off by default" checked={s.features.parentDigest} onChange={(v) => set({ features: { parentDigest: v } })} />
                <Toggle label="Hindi interface" hint="Students can switch the UI language" checked={s.features.hindi} onChange={(v) => set({ features: { hindi: v } })} />
              </Card>
            </>
          )}

          {tab === 'messages' && (
            <Card className="space-y-5">
              <p className="text-sm text-ink-2">Placeholders: <span className="font-mono text-xs">{'{name} {app} {id} {mentor} {link} {deadline} {streak} {points} {pointsName}'}</span></p>
              {[['welcome', 'Welcome email and WhatsApp'], ['reminder', 'Deadline reminder'], ['verified', 'Verified notification']].map(([k, label]) => (
                <div key={k}>
                  <Field label={label}><textarea className="input" rows={3} value={s.messages[k]} onChange={(e) => set({ messages: { [k]: e.target.value } })} /></Field>
                  <div className="mt-1.5 rounded-xl bg-page border border-line px-3 py-2 text-sm text-ink-2"><span className="text-[10px] uppercase font-semibold text-ink-3 mr-2">Preview</span>{fillTemplate(s.messages[k], sample)}</div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SettingsInner />
    </Suspense>
  );
}
