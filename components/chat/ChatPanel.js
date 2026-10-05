'use client';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Pill } from '@/components/ui';
import { sendMessage, useChat } from '@/lib/chat-store';
import { dayLabel, fmtTime } from '@/lib/mock-data';

const ROLE_TONE = { admin: 'dark', mentor: 'accent', student: 'brand' };
const ROLE_LABEL = { admin: 'Admin', mentor: 'Mentor', student: 'Student' };

function renderText(text) {
  return text.split(/(@\w+)/g).map((part, i) => (part.startsWith('@') ? <span key={i} className="font-semibold text-brand">{part}</span> : <span key={i}>{part}</span>));
}

/**
 * Discord-style group chat: a room list, a message stream grouped by day, and a composer.
 * `rooms` = the rooms this viewer belongs to; `me` = { id, name, role }.
 */
export default function ChatPanel({ rooms, me, autoReply }) {
  const { rooms: all } = useChat();
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState(null);
  const endRef = useRef(null);
  const room = rooms.find((r) => r.id === roomId) || rooms[0];
  const messages = all[room.id] || [];
  const pinned = messages.find((m) => m.pinned);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, room.id]);

  function send() {
    const text = draft.trim();
    if (!text && !file) return;
    sendMessage(room.id, me, text || `Shared ${file.name}`, file ? { name: file.name } : null);
    setDraft('');
    setFile(null);
    if (autoReply && room.kind === 'batch' && me.role === 'student') {
      setTimeout(() => sendMessage(room.id, { id: 'm1', name: 'Dr. Anjali Rao', role: 'mentor' }, `@${me.name.split(' ')[0]} good question. I will answer it properly in tonight's doubt session, and anyone who knows can jump in before that.`), 1800);
    }
  }

  const items = messages.map((m, i) => {
    const prev = messages[i - 1];
    const day = dayLabel(m.at);
    const showDay = !prev || dayLabel(prev.at) !== day;
    return { m, day, showDay, grouped: !showDay && prev.author.id === m.author.id, mine: m.author.id === me.id };
  });

  return (
    <div className="card overflow-hidden grid lg:grid-cols-[240px_1fr]" style={{ minHeight: '70vh' }}>
      <aside className="border-b lg:border-b-0 lg:border-r border-line bg-page/60">
        <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-3">Rooms</div>
        <ul className="flex lg:flex-col gap-1 px-2 pb-2 overflow-x-auto">
          {rooms.map((r) => {
            const count = (all[r.id] || []).length;
            return (
              <li key={r.id} className="shrink-0">
                <button type="button" onClick={() => setRoomId(r.id)} className={`w-full text-left rounded-xl px-3 py-2 transition ${r.id === room.id ? 'bg-white shadow-sm ring-1 ring-line' : 'hover:bg-white/70'}`}>
                  <div className="flex items-center gap-2"><span className="text-ink-3">#</span><span className="text-sm font-semibold text-ink truncate">{r.name}</span></div>
                  <div className="text-[11px] text-ink-3 pl-4">{r.members} members · {count} messages</div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="hidden lg:block px-4 pb-4 text-[11px] text-ink-3">Anyone in a room can answer. Mentors and the admin are marked. Be kind, be specific.</div>
      </aside>

      <section className="flex flex-col min-h-0">
        <header className="px-4 sm:px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-display font-bold text-brand-deep"># {room.name}</div>
            <div className="text-xs text-ink-2">{room.description}</div>
          </div>
          <Pill tone="neutral">{room.members} members</Pill>
        </header>
        {pinned && (
          <div className="px-4 sm:px-5 py-2 bg-accent-soft border-b border-accent/40 text-xs text-accent-ink flex items-start gap-2">
            <span aria-hidden="true">📌</span>
            <span><b>{pinned.author.name}:</b> {pinned.text}</span>
          </div>
        )}
        <div className="flex-1 overflow-auto px-4 sm:px-5 py-4 space-y-1" style={{ maxHeight: '55vh' }}>
          {items.map(({ m, day, showDay, grouped, mine }) => {
            return (
              <div key={m.id}>
                {showDay && <div className="flex items-center gap-3 my-3 text-[11px] text-ink-3"><span className="flex-1 h-px bg-line" />{day}<span className="flex-1 h-px bg-line" /></div>}
                <div className={`flex gap-3 rounded-xl px-2 py-1 ${mine ? 'bg-brand-soft/60' : 'hover:bg-page'} ${grouped ? 'mt-0' : 'mt-2'}`}>
                  <div className="w-9 shrink-0">{!grouped && <Avatar name={m.author.name} />}</div>
                  <div className="min-w-0 flex-1">
                    {!grouped && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-ink">{m.author.name}{mine ? ' (you)' : ''}</span>
                        <Pill tone={ROLE_TONE[m.author.role]} className="!py-0">{ROLE_LABEL[m.author.role]}</Pill>
                        <span className="text-[11px] text-ink-3">{fmtTime(m.at)}</span>
                      </div>
                    )}
                    <div className="text-sm text-ink leading-relaxed break-words">{renderText(m.text)}</div>
                    {m.attachment && <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink-2">📎 {m.attachment.name}</div>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <footer className="border-t border-line p-3">
          {file && <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-page px-2 py-1 text-xs">📎 {file.name} <button type="button" className="text-ink-3 hover:text-critical" onClick={() => setFile(null)} aria-label="Remove attachment">×</button></div>}
          <div className="flex items-end gap-2">
            <label className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white cursor-pointer hover:bg-page" title="Attach a photo or PDF">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <span aria-hidden="true">📎</span>
            </label>
            <textarea
              className="input flex-1 resize-none text-sm"
              rows={1}
              placeholder={`Message # ${room.name}. Enter to send, Shift+Enter for a new line.`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button type="button" onClick={send} className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-600">Send</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
