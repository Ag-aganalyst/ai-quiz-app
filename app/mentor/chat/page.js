'use client';
import AppShell from '@/components/shell/AppShell';
import ChatPanel from '@/components/chat/ChatPanel';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { CHAT_ROOMS, MENTOR } from '@/lib/mock-data';

export default function MentorChat() {
  const { labels } = useSettings();
  const profile = useMentorProfile();
  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch, photo: profile.photo }}>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-brand-deep">Chat</h1>
        <p className="text-sm text-ink-2">Your {labels.batch.toLowerCase()} group with all 47 students, and the {labels.mentor.toLowerCase()}s&apos; room with the {labels.admin.toLowerCase()}.</p>
      </div>
      <ChatPanel rooms={[CHAT_ROOMS['batch-m1'], CHAT_ROOMS.mentors]} me={{ id: MENTOR.id, name: MENTOR.name, role: 'mentor' }} />
    </AppShell>
  );
}
