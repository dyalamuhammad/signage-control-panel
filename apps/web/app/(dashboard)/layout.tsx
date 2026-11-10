import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className="w-60 border-r border-zinc-800 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-lg font-semibold">Signage</h1>
          <p className="text-xs text-zinc-500">Control Panel</p>
        </div>
        <nav className="space-y-1 flex-1">
          <Link href="/" className="block px-3 py-2 rounded-md hover:bg-zinc-900 text-sm">Overview</Link>
          <Link href="/devices" className="block px-3 py-2 rounded-md hover:bg-zinc-900 text-sm">Devices</Link>
          <Link href="/contents" className="block px-3 py-2 rounded-md hover:bg-zinc-900 text-sm">Contents</Link>
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}