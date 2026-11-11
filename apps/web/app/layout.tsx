import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Signage Control Panel',
  description: 'Manage devices & contents in real-time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
          {children}
          <Toaster position="top-right" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}