'use client';
// Group chat messages for the prototype, kept in this browser so a message sent on one portal shows on another.
import { createLocalStore } from './local-store';
import { SEED_CHAT } from './mock-data';

const store = createLocalStore('bnm.chat.v1', { rooms: SEED_CHAT });

export const useChat = store.use;
export const resetChat = store.reset;

export function sendMessage(roomId, author, text, attachment) {
  const state = store.get();
  const msg = { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, author, text, at: new Date().toISOString(), attachment: attachment || null };
  store.set({ ...state, rooms: { ...state.rooms, [roomId]: [...(state.rooms[roomId] || []), msg] } });
  return msg;
}
