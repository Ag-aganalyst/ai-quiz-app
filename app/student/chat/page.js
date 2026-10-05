'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import ChatPanel from '@/components/chat/ChatPanel';
import Announcements from '@/components/chat/Announcements';
import CommunityTabs from '@/components/chat/CommunityTabs';
import { StudyRoomCard } from '@/components/chat/StudyRoom';
import { Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useAnnouncements } from '@/lib/announcements-store';
import { CHAT_ROOMS, MENTOR, STUDENT_ME, batchRooms, dmRoomId } from '@/lib/mock-data';

export default function StudentChat() {
  const { labels } = useSettings();
  const [tab, setTab] = useState('announcements');
  const [toast, setToast] = useState('');
  const me = { id: STUDENT_ME.id, name: STUDENT_ME.name, role: 'student' };
  const rooms = batchRooms(MENTOR.id);
  const visible = (a) => a.audience === 'all' || a.audience === MENTOR.id;
  const count = useAnnouncements().filter(visible).length;
  const sections = [
    { title: 'Groups', rooms: [rooms.group, CHAT_ROOMS['students-all']] },
    { title: 'Doubt boxes', rooms: rooms.doubts },
    { title: 'Direct', rooms: [{ id: dmRoomId(MENTOR.id, STUDENT_ME.id), name: `My ${labels.mentor.toLowerCase()} · ${MENTOR.name}`, kind: 'dm', description: `Private between you and ${MENTOR.name}. Personal questions go here.`, members: 2 }] },
  ];
  return (
    <AppShell role="student" user={{ name: STUDENT_ME.name, sub: STUDENT_ME.id }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">Chat</h1>
          <p className="text-sm text-ink-2">Announcements from your {labels.mentor.toLowerCase()} and the {labels.admin.toLowerCase()}, your {labels.batch.toLowerCase()} rooms, and your study room.</p>
        </div>
        <CommunityTabs value={tab} onChange={setTab} tabs={[{ key: 'announcements', label: 'Announcements', icon: '📣', count }, { key: 'chat', label: 'Chat', icon: '💬' }, { key: 'study', label: 'Study room', icon: '🎧' }]} />
      </div>
      {tab === 'announcements' && <Announcements me={me} visibleFor={visible} onToast={setToast} />}
      {tab === 'chat' && <ChatPanel sections={sections} me={me} autoReply />}
      {tab === 'study' && <StudyRoomCard mentorId={MENTOR.id} role="student" />}
    </AppShell>
  );
}
