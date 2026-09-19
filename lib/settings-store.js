'use client';
// A tiny external store for admin settings. Persists to localStorage so the owner's
// customisation survives reloads in this prototype; the production build swaps the
// load/save functions for a Supabase `settings` table without touching the UI.
import { useSyncExternalStore } from 'react';
import { DEFAULT_SETTINGS } from './brand-defaults';

const KEY = 'bmn.settings.v1';
const listeners = new Set();
let state = null;

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

export function deepMerge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
  return out;
}

function load() {
  if (state) return state;
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? deepMerge(DEFAULT_SETTINGS, JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    state = DEFAULT_SETTINGS;
  }
  return state;
}

function emit() {
  listeners.forEach((l) => l());
}

export function getSettings() {
  return load();
}

export function setSettings(next) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep in memory */
  }
  emit();
}

export function updateSettings(patch) {
  setSettings(deepMerge(getSettings(), patch));
}

export function resetSettings() {
  state = DEFAULT_SETTINGS;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSettings() {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULT_SETTINGS);
}
