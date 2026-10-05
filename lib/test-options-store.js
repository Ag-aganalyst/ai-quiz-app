'use client';
// Test types and maximum-marks options for Add Test Record. Mentors can add or remove entries at any time.
import { createLocalStore } from './local-store';
import { MAX_MARKS_OPTIONS, TEST_TYPES } from './mock-data';

const store = createLocalStore('bnm.test-options.v1', { types: TEST_TYPES, maxMarks: MAX_MARKS_OPTIONS });

export const useTestOptions = store.use;
export const resetTestOptions = store.reset;

export function setTestTypes(types) {
  store.set({ ...store.get(), types });
}
export function setMaxMarks(maxMarks) {
  store.set({ ...store.get(), maxMarks: [...new Set(maxMarks)].sort((a, b) => b - a) });
}
