'use client';
import AppShell from '@/components/shell/AppShell';
import ChatPanel from '@/components/chat/ChatPanel';
import { useSettings } from '@/lib/settings-store';
import { CHAT_ROOMS } from '@/lib/mock-data';

export default function AdminChat() {
  const { labels, brand } = useSettings();
  return (
    <AppShell role="admin" user={{ name: labels.admin, sub: brand.appName }}>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-brand-deep">Chat</h1>
        <p className="text-sm text-ink-2">Two rooms: every {labels.mentor.toLowerCase()} with you, and every {labels.student.toLowerCase()} across all batches with you. {labels.mentor}s are not in the student room.</p>
      </div>
      <ChatPanel rooms={[CHAT_ROOMS.mentors, CHAT_ROOMS['students-all']]} me={{ id: 'admin', name: labels.admin, role: 'admin' }} />
    </AppShell>
  );
}
