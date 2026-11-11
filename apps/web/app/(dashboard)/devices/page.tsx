'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeviceLiveBadge } from '@/components/device-live-badge';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/fetcher';
import type { Device } from '@/lib/types';
import { DeviceFormDialog } from '@/components/device-form-dialog';
import { AssignContentSelect } from '@/components/assign-content-select';
import { Skeleton } from '@/components/ui/skeleton';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await apiFetch<Device[]>('/api/devices');
      setDevices(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Hapus device ini?')) return;
    try {
      await apiFetch(`/api/devices/${id}`, { method: 'DELETE' });
      toast.success('Device dihapus');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Devices</h1>
          <p className="text-sm text-zinc-400">
            Kelola device signage yang terhubung
          </p>
        </div>
        <Button
          onClick={() => setOpenForm(true)}
          className=""
        >
          + Tambah Device
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3"
            >
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <div className="text-4xl">📺</div>
            <div>
              <p className="text-[var(--foreground)] font-medium">
                Belum ada device
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Tambahkan device pertama untuk mulai menampilkan content.
              </p>
            </div>
            <Button onClick={() => setOpenForm(true)}>+ Tambah Device</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => (
            <Card key={d.id} className="">
              <CardContent className="px-4 space-y-3">
  <div className="flex items-start justify-between gap-2">
    <div className="min-w-0">
      <h3 className="font-medium text-[var(--foreground)] truncate">
        {d.nama}
      </h3>
      <p className="text-xs text-[var(--muted-foreground)] truncate">
        {d.lokasi || '—'}
      </p>
    </div>
    <DeviceLiveBadge deviceId={d.id} initialStatus={d.status} />
  </div>

  <div className="space-y-1">
    <p className="text-xs text-[var(--muted-foreground)]">Content aktif</p>
    <AssignContentSelect
      deviceId={d.id}
      currentContentId={d.content_id}
      onChanged={load}
    />
  </div>

  <p className="text-[10px] text-[var(--muted-foreground)]/60 font-mono truncate">
    /device/{d.id}
  </p>

  <div className="flex gap-2 pt-1">
    <Button
      size="sm"
      variant="outline"
      onClick={() => window.open(`/device/${d.id}`, '_blank')}
      className="flex-1"
    >
      Buka Client
    </Button>
    <Button
      size="sm"
      variant="destructive"
      onClick={() => handleDelete(d.id)}
      className="flex-1"
    >
      Hapus
    </Button>
  </div>
</CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeviceFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        onSuccess={load}
      />
    </div>
  );
}