'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setErr('Username atau password salah');
      return;
    }
    // di dalam onSubmit, setelah res.ok
    window.location.href = '/';
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Signage Admin</CardTitle>
          <p className="text-sm text-zinc-400">Login untuk mengelola device & content</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u" className="text-zinc-300">Username</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" autoComplete="username" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p" className="text-zinc-300">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" autoComplete="current-password" />
            </div>
            {err && <p className="text-sm text-rose-400">{err}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}