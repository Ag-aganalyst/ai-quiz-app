'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import ChatPanel from '@/components/chat/ChatPanel';
import Announcements from '@/components/chat/Announcements';
import CommunityTabs from '@/components/chat/CommunityTabs';
import { StudyRoomCard } from '@/components/chat/StudyRoom';
import { Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { useAnnouncements } from '@/lib/announcements-store';
import { CHAT_ROOMS, MENTOR, batchRooms } from '@/lib/mock-data';

export default function MentorChat() {
  const { labels } = useSettings();
  const profile = useMentorProfile();
  const [tab, setTab] = useState('announcements');
  const [toast, setToast] = useState('');
  const me = { id: MENTOR.id, name: MENTOR.name, role: 'mentor' };
  const rooms = batchRooms(MENTOR.id);
  const visible = (a) => a.audience === 'all' || a.audience === MENTOR.id;
  const count = useAnnouncements().filter(visible).length;
  const sections = [
    { title: 'Groups', rooms: [rooms.group, CHAT_ROOMS.mentors] },
    { title: 'Doubt boxes', rooms: rooms.doubts },
    { title: 'Students', rooms: rooms.dms, searchable: true },
  ];
  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch, photo: profile.photo }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">Chat</h1>
          <p className="text-sm text-ink-2">{rooms.dms.length} private rooms, one per student, plus the {labels.batch.toLowerCase()} group, three doubt boxes and the {labels.mentor.toLowerCase()}s&apos; room with the {labels.admin.toLowerCase()}.</p>
        </div>
        <CommunityTabs value={tab} onChange={setTab} tabs={[{ key: 'announcements', label: 'Announcements', icon: '📣', count }, { key: 'chat', label: 'Chat', icon: '💬', count: rooms.dms.length + 5 }, { key: 'study', label: 'Study room', icon: '🎧' }]} />
      </div>
      {tab === 'announcements' && <Announcements me={me} canPost audiences={[{ value: MENTOR.id, label: MENTOR.batch }]} visibleFor={visible} onToast={setToast} />}
      {tab === 'chat' && <ChatPanel sections={sections} me={me} />}
      {tab === 'study' && <StudyRoomCard mentorId={MENTOR.id} role="mentor" />}
    </AppShell>
  );
}
