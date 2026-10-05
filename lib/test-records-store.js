'use client';
// Test records: tests taken outside the app, typed in by the mentor, analysed by the student, verified by the mentor.
import { createLocalStore } from './local-store';
import { SEED_TEST_RECORDS } from './mock-data';

const store = createLocalStore('bnm.test-records.v1', { records: SEED_TEST_RECORDS });

export const useTestRecords = () => store.use().records;
export const resetTestRecords = store.reset;

export function addTestRecord(rec) {
  const { records } = store.get();
  const full = { id: `tr-${Date.now()}`, status: 'awaiting_analysis', files: [], ...rec };
  store.set({ records: [full, ...records] });
  return full;
}

export function updateTestRecord(id, patch) {
  const { records } = store.get();
  store.set({ records: records.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
}
