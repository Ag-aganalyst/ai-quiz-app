'use client';
import { useState } from 'react';
import { Avatar, Button, Card, Field, Pill } from '@/components/ui';
import { deleteAnnouncement, postAnnouncement, toggleReaction, useAnnouncements } from '@/lib/announcements-store';
import { fileToDataUrl } from '@/lib/images';
import { REACTIONS, dayLabel, fmtTime, mentorById } from '@/lib/mock-data';

const ROLE_TONE = { admin: 'dark', mentor: 'accent', student: 'brand' };
const ROLE_LABEL = { admin: 'Admin', mentor: 'Mentor', student: 'Student' };
const audienceLabel = (a) => (a === 'all' ? 'All batches' : mentorById(a).batch);

/**
 * Announcement feed. `canPost` lets the viewer write (admin, mentor); everyone can react.
 * `audiences` = [{ value, label }] the poster may address; `visibleFor(a)` filters the feed for the viewer.
 */
export default function Announcements({ me, canPost = false, audiences = [], visibleFor = () => true, onToast }) {
  const items = useAnnouncements().filter(visibleFor);
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [audience, setAudience] = useState(audiences[0]?.value || 'all');
  const [busy, setBusy] = useState(false);

  async function onImage(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      setImage(await fileToDataUrl(f, { max: 1200 }));
    } catch {
      onToast && onToast('Could not read that image.');
    }
    setBusy(false);
  }
  function post(e) {
    e.preventDefault();
    if (!text.trim() && !image) return;
    postAnnouncement({ author: me, audience, text: text.trim(), image });
    setText('');
    setImage('');
    onToast && onToast(`Announced to ${audienceLabel(audience)}.`);
  }

  return (
    <div className="space-y-4">
      {canPost ? (
        <Card>
          <form onSubmit={post} className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar name={me.name} />
              <div className="flex-1">
                <div className="text-sm font-bold">{me.name} <Pill tone={ROLE_TONE[me.role]} className="ml-1 !py-0">{ROLE_LABEL[me.role]}</Pill></div>
                <div className="text-xs text-ink-3">Students can read and react, not reply. Keep it short and actionable.</div>
              </div>
            </div>
            <textarea className="input text-sm" rows={3} placeholder="What should everyone know today?" value={text} onChange={(e) => setText(e.target.value)} />
            {image && (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Attachment preview" className="max-h-48 rounded-xl border border-line" />
                <button type="button" onClick={() => setImage('')} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-deep text-white text-xs" aria-label="Remove image">×</button>
              </div>
            )}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap items-end gap-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-brand-deep cursor-pointer hover:bg-brand-soft">
                  <input type="file" accept="image/*" className="hidden" onChange={onImage} />🖼 {busy ? 'Reading…' : image ? 'Change image' : 'Add image'}
                </label>
                {audiences.length > 1 ? (
                  <Field label="Audience"><select className="input py-2 text-sm" value={audience} onChange={(e) => setAudience(e.target.value)}>{audiences.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></Field>
                ) : (
                  <Pill tone="neutral">To: {audiences[0]?.label || 'All batches'}</Pill>
                )}
              </div>
              <Button type="submit" disabled={!text.trim() && !image}>📣 Announce</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="rounded-xl bg-brand-soft border border-brand-100 px-4 py-2.5 text-sm text-brand-700">Only your mentor and the admin can post here. React to show you have seen it.</div>
      )}

      {items.length === 0 && <Card><div className="py-8 text-center text-sm text-ink-3">No announcements yet.</div></Card>}

      {items.map((a) => {
        const total = Object.values(a.reactions || {}).reduce((n, who) => n + who.length, 0);
        return (
          <Card key={a.id} pad="p-0" className="overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Avatar name={a.author.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-ink">{a.author.name}</span>
                    <Pill tone={ROLE_TONE[a.author.role]} className="!py-0">{ROLE_LABEL[a.author.role]}</Pill>
                    <Pill tone="neutral" className="!py-0">📣 {audienceLabel(a.audience)}</Pill>
                    <span className="text-[11px] text-ink-3">{dayLabel(a.at)} · {fmtTime(a.at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink leading-relaxed whitespace-pre-wrap">{a.text}</p>
                </div>
                {(a.author.id === me.id || me.role === 'admin') && (
                  <button type="button" className="text-xs text-ink-3 hover:text-critical" onClick={() => { deleteAnnouncement(a.id); onToast && onToast('Announcement removed.'); }}>Delete</button>
                )}
              </div>
            </div>
            {a.image && (
              <div className="px-4 sm:px-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt="" className="w-full max-h-96 object-cover rounded-xl border border-line" />
              </div>
            )}
            <div className="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-2">
              {REACTIONS.map((emoji) => {
                const who = a.reactions?.[emoji] || [];
                const on = who.includes(me.id);
                return (
                  <button key={emoji} type="button" onClick={() => toggleReaction(a.id, emoji, me.id)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm ring-1 transition ${on ? 'bg-brand-soft ring-brand text-brand-700' : 'bg-white ring-line hover:ring-brand-200'}`} aria-pressed={on} aria-label={`React ${emoji}`}>
                    <span>{emoji}</span>{who.length > 0 && <span className="text-xs font-semibold tabular">{who.length}</span>}
                  </button>
                );
              })}
              <span className="ml-auto text-[11px] text-ink-3">{total} reaction{total === 1 ? '' : 's'}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
