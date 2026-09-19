// Entry point for the single-file build: a hash router over the same pages the Next.js app uses.
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useHashUrl, splitUrl } from 'next/navigation';
import ThemeApplier from '@/components/brand/ThemeApplier';
import Logo from '@/components/brand/Logo';
import { Button, Card } from '@/components/ui';
import Home from '@/app/page';
import LoginPage from '@/app/login/page';
import StudentHome from '@/app/student/page';
import StudentTask from '@/app/student/task/page';
import MentorDashboard from '@/app/mentor/page';
import VerifyPage from '@/app/mentor/verify/page';
import AssignPage from '@/app/mentor/assign/page';
import StudentsPage from '@/app/mentor/students/page';
import AdminOverview from '@/app/admin/page';
import SettingsPage from '@/app/admin/settings/page';

const ROUTES = {
  '/': Home,
  '/login': LoginPage,
  '/student': StudentHome,
  '/student/task': StudentTask,
  '/mentor': MentorDashboard,
  '/mentor/verify': VerifyPage,
  '/mentor/assign': AssignPage,
  '/mentor/students': StudentsPage,
  '/admin': AdminOverview,
  '/admin/settings': SettingsPage,
};

function NotIncluded({ path }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card pad="p-8" className="max-w-md text-center">
        <div className="flex justify-center mb-4"><Logo /></div>
        <h1 className="font-display text-xl font-bold text-brand-deep">Not part of the offline demo</h1>
        <p className="text-sm text-ink-2 mt-2">
          <span className="font-mono text-xs bg-page px-1.5 py-0.5 rounded">{path}</span> needs the live backend (AI test generation, Supabase). Everything else in the prototype works from this file.
        </p>
        <Button href="/" className="mt-5">Back to start</Button>
      </Card>
    </div>
  );
}

function App() {
  const url = useHashUrl();
  const { path, fragment } = splitUrl(url);
  const Page = ROUTES[path];
  useEffect(() => {
    if (fragment) {
      const el = document.getElementById(fragment);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    window.scrollTo(0, 0);
  }, [url, fragment]);
  return (
    <>
      <ThemeApplier />
      {Page ? <Page key={path} /> : <NotIncluded path={path} />}
    </>
  );
}

document.documentElement.classList.add('h-full', 'antialiased');
document.body.classList.add('min-h-full', 'flex', 'flex-col');
createRoot(document.getElementById('root')).render(<App />);
