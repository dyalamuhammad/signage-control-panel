'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/fetcher';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
};

export function DeviceFormDialog({ open, onOpenChange, onSuccess }: Props) {
  const [nama, setNama] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) return toast.error('Nama wajib diisi');
    try {
      setLoading(true);
      await apiFetch('/api/devices', {
        method: 'POST',
        body: JSON.stringify({ nama, lokasi }),
      });
      toast.success('Device ditambahkan');
      setNama('');
      setLokasi('');
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Tambah Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama</Label>
            <Input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="TV Lobby"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Lokasi</Label>
            <Input
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="Gedung A - Lantai 1"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full "
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}