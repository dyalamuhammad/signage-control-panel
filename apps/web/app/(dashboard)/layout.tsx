'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LogoutButton } from '@/components/logout-button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/devices', label: 'Devices' },
  { href: '/contents', label: 'Contents' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Signage</h1>
          <p className="text-xs text-[var(--muted-foreground)]">Control Panel</p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-md hover:bg-[var(--accent)]"
          aria-label="Tutup menu"
        >
          <X className="size-4" />
        </button>
      </div>
      <nav className="space-y-1 flex-1">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-[var(--accent)] text-[var(--foreground)] font-medium'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]/50 hover:text-[var(--foreground)]',
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <LogoutButton />
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Topbar mobile */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur px-4 h-14">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md hover:bg-[var(--accent)]"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-semibold tracking-tight">Signage</span>
        <div className="w-8" />
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)]/40 p-4 flex-col min-h-[calc(100vh-0px)] sticky top-0 h-screen">
          {sidebarContent}
        </aside>

        {/* Sidebar mobile (overlay) */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] p-4 flex flex-col md:hidden animate-in slide-in-from-left duration-200">
              {sidebarContent}
            </aside>
          </>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-auto bg-[var(--background)] min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
