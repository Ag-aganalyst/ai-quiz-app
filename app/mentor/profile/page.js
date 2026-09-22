'use client';
import { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import Sparkline from '@/components/viz/Sparkline';
import { Avatar, Button, Card, Field, Pill, SectionTitle, StatTile, Toast } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';
import { resetMentorProfile, updateMentorProfile, useMentorProfile } from '@/lib/mentor-profile-store';
import { MENTOR, MENTOR_JOURNEY, MENTOR_RANKING, STUDENTS, fmtLong } from '@/lib/mock-data';

/** Shrinks an image file to a 512px square data URL so the photo stays small everywhere it is shown. */
export function readPhoto(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      cb(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

export default function MentorProfilePage() {
  const { labels } = useSettings();
  const profile = useMentorProfile();
  const [toast, setToast] = useState('');
  const me = MENTOR_RANKING.find((m) => m.id === MENTOR.id);

  function onPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return setToast('Photo is over 2 MB. Please pick a smaller one.');
    readPhoto(f, (dataUrl) => {
      updateMentorProfile({ photo: dataUrl });
      setToast('Photo updated. Students and parents see it now.');
    });
  }

  return (
    <AppShell role="mentor" user={{ name: MENTOR.name, sub: MENTOR.batch, photo: profile.photo }}>
      <Toast message={toast} onDone={() => setToast('')} />
      <h1 className="font-display text-2xl font-bold text-brand-deep mb-1">My profile</h1>
      <p className="text-sm text-ink-2 mb-5">Your photo and details appear to your students, their parents and the {labels.admin.toLowerCase()}. Change them any time.</p>

      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        <div className="space-y-4">
          <Card className="text-center">
            <Avatar name={MENTOR.name} src={profile.photo} size="xl" className="mx-auto" />
            <div className="mt-3 font-display text-xl font-bold text-brand-deep">{MENTOR.name}</div>
            <div className="text-sm text-ink-2">{profile.subject || MENTOR.subject} · {MENTOR.qualification}</div>
            <div className="mt-1 text-xs text-ink-3">{MENTOR.batch} · {MENTOR.batchNick} · joined {fmtLong(MENTOR.joined)}</div>
            <div className="mt-4 flex justify-center gap-2">
              <label className="inline-flex"><input type="file" accept="image/*" className="hidden" onChange={onPhoto} /><span className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 cursor-pointer">{profile.photo ? 'Change photo' : 'Upload photo'}</span></label>
              {profile.photo && <Button variant="secondary" onClick={() => { updateMentorProfile({ photo: '' }); setToast('Photo removed.'); }}>Remove</Button>}
            </div>
            <p className="text-[11px] text-ink-3 mt-2">Square crop, under 2 MB. Shown as a circle everywhere.</p>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Rank" value={`#${me?.rank}`} hint="among mentors" />
            <StatTile label="Avg / student" value={me?.avgPoints.toLocaleString('en-IN')} hint={`${me?.totalPoints.toLocaleString('en-IN')} total`} />
            <StatTile label="Mentor streak" value={`${MENTOR.streak}d`} hint="same-day verification" />
            <StatTile label="Verifications" value={MENTOR.verifications.toLocaleString('en-IN')} hint="all time" />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4">
            <SectionTitle title="Details" subtitle={`Name and batch are set by the ${labels.admin.toLowerCase()}. Everything else is yours.`} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name"><input className="input bg-page" value={MENTOR.name} readOnly /></Field>
              <Field label={labels.batch}><input className="input bg-page" value={`${MENTOR.batch} · ${STUDENTS.length} students`} readOnly /></Field>
              <Field label="Subject"><input className="input" value={profile.subject || MENTOR.subject} onChange={(e) => updateMentorProfile({ subject: e.target.value })} /></Field>
              <Field label="Phone (for parent callbacks)"><input className="input" value={profile.phone || MENTOR.phone} onChange={(e) => updateMentorProfile({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></Field>
            </div>
            <Field label="Short bio" hint="Two lines students and parents will read on your card"><textarea className="input" rows={3} value={profile.bio} onChange={(e) => updateMentorProfile({ bio: e.target.value })} placeholder="e.g. AIIMS graduate, 6 years of NEET Biology mentoring. I reply to doubts before 9 PM." /></Field>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => { resetMentorProfile(); setToast('Profile reset.'); }}>Reset</Button>
              <Button onClick={() => setToast('Saved.')}>Save details</Button>
            </div>
          </Card>
          <Card>
            <SectionTitle title="My journey" subtitle="Milestones since you joined" action={<Sparkline values={MENTOR.trend} width={120} height={32} />} />
            <ol className="relative border-l border-line ml-2 space-y-3">
              {MENTOR_JOURNEY[MENTOR.id].map((j, i) => (
                <li key={i} className="pl-4">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand ring-4 ring-white" />
                  <div className="text-xs text-ink-3">{j.when}</div>
                  <div className="text-sm">{j.what}</div>
                </li>
              ))}
            </ol>
            <div className="mt-3"><Pill tone="accent" icon="🔥">{MENTOR.streak}-day streak · keep verifying same day</Pill></div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
