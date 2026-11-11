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
<aside className="w-60 border-r border-[var(--border)] bg-[var(--card)]/40 p-4 flex flex-col">
        <div className="mb-8">
<h1 className="text-lg font-semibold tracking-tight">Signage</h1>
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
  'block px-3 py-2 rounded-lg text-sm transition-all duration-150',
  active
    ? 'bg-[var(--accent)] text-[var(--foreground)] font-medium'
    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]/50 hover:text-[var(--foreground)]'
)}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
      </aside>
     <main className="flex-1 p-8 overflow-auto bg-[var(--background)]">{children}</main>
    </div>
  );
}