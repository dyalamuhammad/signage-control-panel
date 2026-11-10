'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }
  return (
    <Button variant="outline" onClick={logout} className="w-full mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-900">
      Logout
    </Button>
  );
}