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
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          + Tambah Device
        </Button>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Memuat...</p>
      ) : devices.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center text-zinc-400 text-sm">
            Belum ada device. Klik "Tambah Device" untuk mulai.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => (
            <Card key={d.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-zinc-100">{d.nama}</h3>
                    <p className="text-xs text-zinc-500">{d.lokasi || '—'}</p>
                  </div>
                  <DeviceLiveBadge deviceId={d.id} initialStatus={d.status} />
                </div>
                <div className="space-y-1">
                <p className="text-xs text-zinc-500">Content aktif</p>
                <AssignContentSelect
                    deviceId={d.id}
                    currentContentId={d.content_id}
                    onChanged={load}
                />
                </div>
                <p className="text-[10px] text-zinc-600 font-mono truncate">
                /device/{d.id}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(`/device/${d.id}`, '_blank')
                    }
                    className="border-zinc-700 text-zinc-300"
                  >
                    Buka Client
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(d.id)}
                    className="border-rose-800 text-rose-400 hover:bg-rose-950"
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