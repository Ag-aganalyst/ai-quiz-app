'use client';
import AppShell from '@/components/shell/AppShell';
import ChatPanel from '@/components/chat/ChatPanel';
import { useSettings } from '@/lib/settings-store';
import { CHAT_ROOMS, STUDENT_ME } from '@/lib/mock-data';

export default function StudentChat() {
  const { labels } = useSettings();
  return (
    <AppShell role="student" user={{ name: STUDENT_ME.name, sub: STUDENT_ME.id }}>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-brand-deep">Chat</h1>
        <p className="text-sm text-ink-2">Your {labels.batch.toLowerCase()} group with your {labels.mentor.toLowerCase()}, and the school room with the {labels.admin.toLowerCase()}. Ask anything; anyone can answer.</p>
      </div>
      <ChatPanel rooms={[CHAT_ROOMS['batch-m1'], CHAT_ROOMS['students-all']]} me={{ id: STUDENT_ME.id, name: STUDENT_ME.name, role: 'student' }} autoReply />
    </AppShell>
  );
}
