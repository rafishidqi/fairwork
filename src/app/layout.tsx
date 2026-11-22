import type { Metadata } from 'next';
import './globals.css';
import { FairWorkProvider } from '@/lib/fairwork-store';

export const metadata: Metadata = {
  title: 'FairWork | Transparent University Group Work Platform',
  description:
    'FairWork makes individual contributions in university group assignments visible. Milestone tracking, proof-of-work peer review, and transparent contribution summaries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <FairWorkProvider>{children}</FairWorkProvider>
      </body>
    </html>
  );
}
