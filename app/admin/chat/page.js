'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import ChatPanel from '@/components/chat/ChatPanel';
import Announcements from '@/components/chat/Announcements';
import CommunityTabs from '@/components/chat/CommunityTabs';
import { StudyRoomsEditor } from '@/components/chat/StudyRoom';
import { Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useAnnouncements } from '@/lib/announcements-store';
import { CHAT_ROOMS, MENTORS } from '@/lib/mock-data';

export default function AdminChat() {
  const { labels, brand } = useSettings();
  const [tab, setTab] = useState('announcements');
  const [toast, setToast] = useState('');
  const me = { id: 'admin', name: labels.admin, role: 'admin' };
  const count = useAnnouncements().length;
  const sections = [{ title: 'Groups', rooms: [CHAT_ROOMS.mentors, CHAT_ROOMS['students-all']] }];
  return (
    <AppShell role="admin" user={{ name: labels.admin, sub: brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">Chat</h1>
          <p className="text-sm text-ink-2">Announce to every batch or one batch, chat with all {labels.mentor.toLowerCase()}s or all {labels.student.toLowerCase()}s, and manage each batch&apos;s study room.</p>
        </div>
        <CommunityTabs value={tab} onChange={setTab} tabs={[{ key: 'announcements', label: 'Announcements', icon: '📣', count }, { key: 'chat', label: 'Chat', icon: '💬' }, { key: 'study', label: 'Study rooms', icon: '🎧' }]} />
      </div>
      {tab === 'announcements' && <Announcements me={me} canPost audiences={[{ value: 'all', label: 'All batches' }, ...MENTORS.map((m) => ({ value: m.id, label: `${m.batch} only` }))]} onToast={setToast} />}
      {tab === 'chat' && <ChatPanel sections={sections} me={me} />}
      {tab === 'study' && <StudyRoomsEditor onToast={setToast} />}
    </AppShell>
  );
}
