'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/logout-button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/devices', label: 'Devices' },
  { href: '/contents', label: 'Contents' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className="w-60 border-r border-zinc-800 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-lg font-semibold">Signage</h1>
          <p className="text-xs text-zinc-500">Control Panel</p>
        </div>
        <nav className="space-y-1 flex-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}