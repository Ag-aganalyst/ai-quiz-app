import { Outfit, Manrope } from 'next/font/google';
import './globals.css';
import ThemeApplier from '@/components/brand/ThemeApplier';

const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'], weight: ['500', '600', '700', '800'] });
const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'Brainy Media',
  description: 'Mentor-led daily practice: one task a day, instant analysis, streaks and points.',
  icons: { icon: '/brand/bmn-logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeApplier />
        {children}
      </body>
    </html>
  );
}
