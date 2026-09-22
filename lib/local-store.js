'use client';
// A tiny localStorage-backed external store. Used for admin settings and, in the prototype,
// for the mentor's own profile. Production swaps the load/save for Supabase without touching the UI.
import { useSyncExternalStore } from 'react';

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

export function deepMerge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
  return out;
}

export function createLocalStore(key, defaults) {
  const listeners = new Set();
  let state = null;
  const emit = () => listeners.forEach((l) => l());
  function load() {
    if (state) return state;
    if (typeof window === 'undefined') return defaults;
    try {
      const raw = window.localStorage.getItem(key);
      state = raw ? deepMerge(defaults, JSON.parse(raw)) : defaults;
    } catch {
      state = defaults;
    }
    return state;
  }
  function set(next) {
    state = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable: keep in memory */
    }
    emit();
  }
  function subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  }
  return {
    get: load,
    set,
    update: (patch) => set(deepMerge(load(), patch)),
    reset: () => {
      state = defaults;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      emit();
    },
    use: () => useSyncExternalStore(subscribe, load, () => defaults),
  };
}
