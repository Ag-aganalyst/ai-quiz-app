'use client';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Pill } from '@/components/ui';
import { sendMessage, useChat } from '@/lib/chat-store';
import { dayLabel, fmtTime } from '@/lib/mock-data';

const ROLE_TONE = { admin: 'dark', mentor: 'accent', student: 'brand' };
const ROLE_LABEL = { admin: 'Admin', mentor: 'Mentor', student: 'Student' };
const KIND_ICON = { batch: '#', school: '#', mentors: '#', doubt: '?', dm: '@' };

function renderText(text) {
  return text.split(/(@\w+)/g).map((part, i) => (part.startsWith('@') ? <span key={i} className="font-semibold text-brand">{part}</span> : <span key={i}>{part}</span>));
}

/**
 * Discord-style chat: sections of rooms on the left (groups, doubt boxes, direct messages, searchable when long),
 * a message stream grouped by day, and a composer. `sections` = [{ title, rooms, searchable }]; `me` = { id, name, role }.
 */
export default function ChatPanel({ sections, me, autoReply }) {
  const { rooms: all } = useChat();
  const flat = sections.flatMap((s) => s.rooms);
  const [roomId, setRoomId] = useState(flat[0]?.id);
  const [query, setQuery] = useState('');
  const [mobileList, setMobileList] = useState(true);
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState(null);
  const endRef = useRef(null);
  const room = flat.find((r) => r.id === roomId) || flat[0];
  const messages = (room && all[room.id]) || [];
  const pinned = messages.find((m) => m.pinned);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, room?.id]);

  function pick(id) {
    setRoomId(id);
    setMobileList(false);
  }

  function send() {
    const text = draft.trim();
    if (!text && !file) return;
    sendMessage(room.id, me, text || `Shared ${file.name}`, file ? { name: file.name } : null);
    setDraft('');
    setFile(null);
    if (autoReply && me.role === 'student' && (room.kind === 'batch' || room.kind === 'dm' || room.kind === 'doubt')) {
      const reply = room.kind === 'dm' ? `Got it, ${me.name.split(' ')[0]}. I will reply properly by tonight.` : `@${me.name.split(' ')[0]} good question. I will answer it in tonight's doubt session, and anyone who knows can jump in before that.`;
      setTimeout(() => sendMessage(room.id, { id: 'm1', name: 'Dr. Anjali Rao', role: 'mentor' }, reply), 1800);
    }
  }

  const items = messages.map((m, i) => {
    const prev = messages[i - 1];
    const day = dayLabel(m.at);
    const showDay = !prev || dayLabel(prev.at) !== day;
    return { m, day, showDay, grouped: !showDay && prev.author.id === m.author.id, mine: m.author.id === me.id };
  });
  const preview = (r) => {
    const last = (all[r.id] || []).slice(-1)[0];
    return last ? `${last.author.id === me.id ? 'You: ' : ''}${last.text}` : r.sub || `${r.members} members`;
  };

  return (
    <div className="card overflow-hidden grid lg:grid-cols-[270px_1fr]" style={{ minHeight: '70vh' }}>
      <aside className={`${mobileList ? '' : 'hidden'} lg:block border-b lg:border-b-0 lg:border-r border-line bg-page/60 max-h-[75vh] overflow-auto`}>
        {sections.map((sec) => {
          const rooms = sec.searchable && query ? sec.rooms.filter((r) => `${r.name} ${r.sub || ''}`.toLowerCase().includes(query.toLowerCase())) : sec.rooms;
          return (
            <div key={sec.title} className="pb-2">
              <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                <span>{sec.title}</span><span>{sec.rooms.length}</span>
              </div>
              {sec.searchable && (
                <div className="px-3 pb-2"><input className="input py-1.5 text-xs" placeholder={`Search ${sec.title.toLowerCase()}`} value={query} onChange={(e) => setQuery(e.target.value)} /></div>
              )}
              <ul className="px-2 space-y-0.5">
                {rooms.map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => pick(r.id)} className={`w-full text-left rounded-xl px-3 py-2 transition ${r.id === room?.id ? 'bg-white shadow-sm ring-1 ring-line' : 'hover:bg-white/70'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        {r.kind === 'dm' ? <Avatar name={r.name} size="sm" /> : <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-700 text-sm font-bold">{KIND_ICON[r.kind] || '#'}</span>}
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink truncate">{r.name}</span>
                          <span className="block text-[11px] text-ink-3 truncate">{preview(r)}</span>
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
                {!rooms.length && <li className="px-3 py-2 text-xs text-ink-3">No match.</li>}
              </ul>
            </div>
          );
        })}
        <div className="hidden lg:block px-4 pb-4 text-[11px] text-ink-3">Anyone in a room can answer. Direct messages are private between the two of you.</div>
      </aside>

      <section className={`${mobileList ? 'hidden' : 'flex'} lg:flex flex-col min-h-0`}>
        <header className="px-4 sm:px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button type="button" className="lg:hidden rounded-lg border border-line px-2 py-1 text-xs font-semibold" onClick={() => setMobileList(true)}>← Rooms</button>
            <div className="min-w-0">
              <div className="font-display font-bold text-brand-deep truncate">{room?.kind === 'dm' ? '@' : '#'} {room?.name}</div>
              <div className="text-xs text-ink-2 truncate">{room?.description}</div>
            </div>
          </div>
          <Pill tone={room?.kind === 'dm' ? 'accent' : 'neutral'}>{room?.kind === 'dm' ? 'Private · 2 people' : `${room?.members} members`}</Pill>
        </header>
        {pinned && (
          <div className="px-4 sm:px-5 py-2 bg-accent-soft border-b border-accent/40 text-xs text-accent-ink flex items-start gap-2">
            <span aria-hidden="true">📌</span>
            <span><b>{pinned.author.name}:</b> {pinned.text}</span>
          </div>
        )}
        <div className="flex-1 overflow-auto px-4 sm:px-5 py-4 space-y-1" style={{ maxHeight: '55vh' }}>
          {!items.length && (
            <div className="h-full flex items-center justify-center text-center text-sm text-ink-3 py-10">
              {room?.kind === 'dm' ? `No messages yet. Say hi to ${room.name}. Only the two of you can read this.` : 'No messages yet. Start the conversation.'}
            </div>
          )}
          {items.map(({ m, day, showDay, grouped, mine }) => (
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
          ))}
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
              placeholder={`Message ${room?.kind === 'dm' ? '@' : '#'} ${room?.name}. Enter to send, Shift+Enter for a new line.`}
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
