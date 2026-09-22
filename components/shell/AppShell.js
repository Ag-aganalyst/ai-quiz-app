'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Avatar, Pill } from '@/components/ui';
import { useSettings } from '@/lib/settings-store';

const NAV = {
  student: [
    { href: '/student', label: 'Home', icon: '🏠' },
    { href: '/student/task', label: "Today's task", icon: '🎯' },
    { href: '/student#leaderboard', label: 'Rankings', icon: '🏆' },
  ],
  parent: [
    { href: '/parent', label: 'Home', icon: '🏠' },
    { href: '/parent#tests', label: 'Tests', icon: '📝' },
  ],
  mentor: [
    { href: '/mentor', label: 'Dashboard', icon: '📊' },
    { href: '/mentor/verify', label: 'Verify', icon: '✅' },
    { href: '/mentor/students', label: 'Students', icon: '👥' },
    { href: '/mentor/profile', label: 'Profile', icon: '🪪' },
  ],
  admin: [
    { href: '/admin', label: 'Overview', icon: '🧭' },
    { href: '/admin/tasks', label: 'Task plan', icon: '🗓' },
    { href: '/admin/mentors', label: 'Mentors', icon: '🧑‍🏫' },
    { href: '/admin/settings', label: 'Customise', icon: '🎨' },
  ],
};

export default function AppShell({ role = 'student', user, children }) {
  const pathname = usePathname();
  const { labels, brand } = useSettings();
  const nav = NAV[role] || [];
  const roleLabel = { admin: labels.admin, mentor: labels.mentor, parent: labels.parent, student: labels.student }[role];
  const isActive = (href) => pathname === href.split('#')[0];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-gradient text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo href={`/${role}`} />
            <span className="hidden sm:block font-display font-bold text-lg">{brand.appName}</span>
            <Pill tone="accent" className="hidden md:inline-flex">{roleLabel} console</Pill>
          </div>
          <nav className="hidden sm:flex items-center gap-1" aria-label="Primary">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${isActive(n.href) ? 'bg-white text-brand-deep' : 'text-white/85 hover:bg-white/12'}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-[11px] text-white/70">{user?.sub}</div>
            </div>
            <Avatar name={user?.name || roleLabel} src={user?.photo} />
            <Link href="/login" className="text-xs text-white/70 hover:text-white underline-offset-2 hover:underline" title="Switch role (demo)">
              Switch
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 pb-24 sm:pb-10">{children}</main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-line" aria-label="Mobile">
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${nav.length}, 1fr)` }}>
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${isActive(n.href) ? 'text-brand' : 'text-ink-3'}`}>
                <span className="text-lg leading-none" aria-hidden="true">{n.icon}</span>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
