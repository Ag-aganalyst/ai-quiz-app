'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';
import StudentProfile from '@/components/profile/StudentProfile';
import { Card, EmptyState, Toast } from '@/components/ui';
import { useMentorProfile } from '@/lib/mentor-profile-store';
import { MENTOR, STUDENTS, mentorById, studentById } from '@/lib/mock-data';

function Inner() {
  const params = useSearchParams();
  const profile = useMentorProfile();
  const [toast, setToast] = useState('');
  const student = studentById(params.get('id')) || STUDENTS[0];
  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch, photo: profile.photo }}>
      <Toast message={toast} onDone={() => setToast('')} />
      {student.mentorId !== MENTOR.id ? (
        <Card><EmptyState icon="🔒" title="Not in your batch" body="You can only open profiles of your own students." /></Card>
      ) : (
        <StudentProfile student={student} mentor={mentorById(student.mentorId)} mentorPhoto={profile.photo} backHref="/mentor/students" backLabel="Students" onToast={setToast} />
      )}
    </AppShell>
  );
}

export default function MentorStudentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Inner />
    </Suspense>
  );
}
