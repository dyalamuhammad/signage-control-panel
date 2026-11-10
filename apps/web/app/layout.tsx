import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Signage Control Panel',
  description: 'Manage devices & contents in real-time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}