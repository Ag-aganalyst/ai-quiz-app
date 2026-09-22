'use client';
// Admin settings. Persist in localStorage for the prototype; the production build reads a `settings` table.
import { DEFAULT_SETTINGS } from './brand-defaults';
import { createLocalStore, deepMerge } from './local-store';

const store = createLocalStore('bnm.settings.v2', DEFAULT_SETTINGS);

export { deepMerge };
export const getSettings = store.get;
export const setSettings = store.set;
export const updateSettings = store.update;
export const resetSettings = store.reset;
export const useSettings = store.use;
