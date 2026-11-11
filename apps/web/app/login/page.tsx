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
  <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-xl tracking-tight">Signage Admin</CardTitle>
        <p className="text-sm text-[var(--muted-foreground)]">
          Login untuk mengelola device & content
        </p>
      </CardHeader>
      <CardContent className='px-4'>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="u">Username</Label>
            <Input
              id="u"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p">Password</Label>
            <Input
              id="p"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {err && (
            <p className="text-sm text-[var(--destructive)]">{err}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
);
}