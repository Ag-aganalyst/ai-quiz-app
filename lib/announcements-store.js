'use client';
// Announcements: admin and mentors post (text + optional image); everyone reacts; students cannot write.
import { createLocalStore } from './local-store';
import { SEED_ANNOUNCEMENTS } from './mock-data';

const store = createLocalStore('bnm.announcements.v1', { items: SEED_ANNOUNCEMENTS });

export const useAnnouncements = () => store.use().items;
export const resetAnnouncements = store.reset;

export function postAnnouncement({ author, audience, text, image }) {
  const { items } = store.get();
  const item = { id: `an-${Date.now()}`, author, audience, text, image: image || '', at: new Date().toISOString(), reactions: {} };
  store.set({ items: [item, ...items] });
  return item;
}

export function toggleReaction(id, emoji, userId) {
  const { items } = store.get();
  store.set({
    items: items.map((a) => {
      if (a.id !== id) return a;
      const who = a.reactions[emoji] || [];
      const next = who.includes(userId) ? who.filter((u) => u !== userId) : [...who, userId];
      return { ...a, reactions: { ...a.reactions, [emoji]: next } };
    }),
  });
}

export function deleteAnnouncement(id) {
  const { items } = store.get();
  store.set({ items: items.filter((a) => a.id !== id) });
}
