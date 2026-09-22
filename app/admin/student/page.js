'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';
import StudentProfile from '@/components/profile/StudentProfile';
import { Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { ALL_STUDENTS, mentorById, studentById } from '@/lib/mock-data';

function Inner() {
  const params = useSearchParams();
  const { labels, brand } = useSettings();
  const profile = useMentorProfile();
  const [toast, setToast] = useState('');
  const student = studentById(params.get('id')) || ALL_STUDENTS[0];
  const mentor = mentorById(student.mentorId);
  return (
    <AppShell role="admin" user={{ name: labels.admin, sub: brand.appName }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <StudentProfile student={student} mentor={mentor} mentorPhoto={mentor.id === 'm1' ? profile.photo : ''} backHref={`/admin/mentor?id=${mentor.id}`} backLabel={mentor.name} onToast={setToast} canTransfer />
    </AppShell>
  );
}

export default function AdminStudentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Inner />
    </Suspense>
  );
}
