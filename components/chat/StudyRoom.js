'use client';
import { useState } from 'react';
import { Button, Card, Field, Pill, SectionTitle } from '@/components/ui';
import { updateSettings, useSettings } from '@/lib/settings-store';
import { MENTORS, mentorById } from '@/lib/mock-data';

/** The viewer's batch study room: one Discord link, hours and house rules, set by the admin. */
export function StudyRoomCard({ mentorId, role = 'student' }) {
  const { studyRooms, labels } = useSettings();
  const room = studyRooms?.[mentorId] || {};
  const m = mentorById(mentorId);
  return (
    <Card className="overflow-hidden relative" pad="p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#5865f2]/15 blur-2xl" aria-hidden="true" />
      <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center relative">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5865f2] text-white text-3xl shadow" aria-hidden="true">🎧</span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-brand-deep">{m.batch} study room</h2>
            <Pill tone={room.url ? 'good' : 'warn'}>{room.url ? 'Open' : 'Link not set yet'}</Pill>
          </div>
          <p className="text-sm text-ink-2 mt-1">{room.hours ? `🕗 ${room.hours}` : 'Hours to be announced'} · on Discord · set by the {labels.admin.toLowerCase()}</p>
          {room.note && <p className="text-sm text-ink mt-2">{room.note}</p>}
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
            <li>Study together with your {labels.batch.toLowerCase()}</li><li>Your {labels.mentor.toLowerCase()} drops in</li><li>Mic muted unless asked</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          {room.url ? (
            <a href={room.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865f2] px-5 py-3 text-sm font-semibold text-white hover:brightness-110">Join on Discord ↗</a>
          ) : (
            <Button size="lg" disabled>Join on Discord ↗</Button>
          )}
          {role === 'mentor' && <span className="text-[11px] text-ink-3 text-center">Need a change? Ask the {labels.admin.toLowerCase()}.</span>}
        </div>
      </div>
    </Card>
  );
}

/** Admin editor: one link, hours and note per batch, changeable any time. */
export function StudyRoomsEditor({ onToast }) {
  const { studyRooms, labels } = useSettings();
  const [draft, setDraft] = useState(() => Object.fromEntries(MENTORS.map((m) => [m.id, { url: '', hours: '', note: '', ...(studyRooms?.[m.id] || {}) }])));
  const save = (id) => {
    updateSettings({ studyRooms: { [id]: draft[id] } });
    onToast && onToast(`${mentorById(id).batch} study room updated. Students and the mentor see it now.`);
  };
  return (
    <div className="space-y-4">
      <SectionTitle title="Study rooms" subtitle={`One Discord room per ${labels.batch.toLowerCase()}. Paste the invite link, set the hours and a short note. Changes go live immediately.`} />
      {MENTORS.map((m) => {
        const d = draft[m.id];
        return (
          <Card key={m.id}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div><span className="font-display font-bold text-brand-deep">{m.batch}</span> <span className="text-sm text-ink-2">· {m.name} · {m.seats} students</span></div>
              <Pill tone={d.url ? 'good' : 'warn'}>{d.url ? 'Link set' : 'No link'}</Pill>
            </div>
            <div className="grid md:grid-cols-[1.4fr_0.8fr_1.4fr_auto] gap-3 items-end">
              <Field label="Discord invite link"><input className="input" placeholder="https://discord.gg/…" value={d.url} onChange={(e) => setDraft({ ...draft, [m.id]: { ...d, url: e.target.value.trim() } })} /></Field>
              <Field label="Hours"><input className="input" placeholder="8 to 10 PM daily" value={d.hours} onChange={(e) => setDraft({ ...draft, [m.id]: { ...d, hours: e.target.value } })} /></Field>
              <Field label="Note for students"><input className="input" placeholder="Rules, focus of the week…" value={d.note} onChange={(e) => setDraft({ ...draft, [m.id]: { ...d, note: e.target.value } })} /></Field>
              <div className="flex gap-2">
                {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-brand-deep hover:bg-brand-soft">Test ↗</a>}
                <Button onClick={() => save(m.id)}>Save</Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
