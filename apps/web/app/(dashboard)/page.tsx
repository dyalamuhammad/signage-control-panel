'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/fetcher';
import type { Device, Content } from '@/lib/types';
import { subscribe } from '@/lib/ws-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverviewPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch<Device[]>('/api/devices'), apiFetch<Content[]>('/api/contents')])
      .then(([d, c]) => {
        setDevices(d);
        setContents(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type === 'device:status') {
        setDevices((prev) =>
          prev.map((d) => (d.id === msg.deviceId ? { ...d, status: msg.status } : d)),
        );
      }
    });
  }, []);

  const online = devices.filter((d) => d.status === 'online').length;
  const offline = devices.length - online;

  const stats = [
    { label: 'Total Device', value: devices.length, color: 'text-zinc-100' },
    { label: 'Online', value: online, color: 'text-emerald-400' },
    { label: 'Offline', value: offline, color: 'text-rose-400' },
    { label: 'Total Content', value: contents.length, color: 'text-zinc-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Ringkasan status signage Anda</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))
          : stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
                  <p className={`text-2xl sm:text-3xl font-semibold tracking-tight ${s.color}`}>
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardContent className="p-4 flex items-start gap-3">
          <span className="text-lg leading-none">💡</span>
          <p className="text-sm text-[var(--muted-foreground)]">
            Status online/offline diperbarui <b>real-time</b> via WebSocket. Ganti content device
            untuk melihat update langsung di device client.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
