'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/fetcher';
import type { Device, Content } from '@/lib/types';
import { subscribe } from '@/lib/ws-client';

export default function OverviewPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch<Device[]>('/api/devices'),
      apiFetch<Content[]>('/api/contents'),
    ])
      .then(([d, c]) => {
        setDevices(d);
        setContents(c);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type === 'device:status') {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === msg.deviceId ? { ...d, status: msg.status } : d
          )
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
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-zinc-400">
          Ringkasan status signage Anda
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <p className="text-sm text-zinc-400">
            💡 Status online/offline saat ini masih <b>statis</b>. Update
            real-time via WebSocket akan ditambahkan di Hari 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}