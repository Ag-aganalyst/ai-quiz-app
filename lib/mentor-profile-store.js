'use client';
// The signed-in mentor's own editable profile (photo, bio). Prototype-only persistence.
import { createLocalStore } from './local-store';

export const DEFAULT_MENTOR_PROFILE = { photo: '', bio: '', subject: '', phone: '' };
const store = createLocalStore('bnm.mentor-profile.v1', DEFAULT_MENTOR_PROFILE);

export const useMentorProfile = store.use;
export const updateMentorProfile = store.update;
export const resetMentorProfile = store.reset;
