'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/fetcher';

function isValidUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
};

const TIPE = [
  { value: 'text', label: 'Teks' },
  { value: 'url', label: 'URL Website' },
  { value: 'image', label: 'Gambar (upload/URL)' },
  { value: 'video', label: 'Video (upload/URL)' },
];

export function ContentFormDialog({ open, onOpenChange, onSuccess }: Props) {
  const [judul, setJudul] = useState('');
  const [tipe, setTipe] = useState<string>('text');
  const [payload, setPayload] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');
      setPayload(data.url);
      toast.success('File terupload');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!judul.trim()) return toast.error('Judul wajib diisi');
    if (!payload.trim()) return toast.error('Payload wajib diisi');

    if ((tipe === 'url' || tipe === 'image' || tipe === 'video') && !isValidUrl(payload)) {
      return toast.error('URL harus diawali http:// atau https://');
    }

    try {
      setLoading(true);
      await apiFetch('/api/contents', {
        method: 'POST',
        body: JSON.stringify({ judul, tipe, payload }),
      });
      toast.success('Content ditambahkan');
      setJudul('');
      setTipe('text');
      setPayload('');
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const showUpload = tipe === 'image' || tipe === 'video';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Judul</Label>
            <Input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="border-zinc-700"
              placeholder="Welcome Screen"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipe</Label>
            <Select
              value={tipe}
              onValueChange={(value) => {
                if (value === null) return;
                setTipe(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border border-[var(--border)] text-[var(--card-foreground)]">
                {TIPE.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showUpload && (
            <div className="space-y-1.5">
              <Label>Upload File</Label>
              <Input
                type="file"
                accept={tipe === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFile}
                disabled={uploading}
                className="border-zinc-700"
              />
              {uploading && <p className="text-xs text-zinc-500">Mengupload...</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>
              {tipe === 'text' ? 'Isi Teks' : tipe === 'url' ? 'URL Website' : 'URL File'}
            </Label>
            {tipe === 'text' ? (
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
                placeholder="Selamat datang di gedung kami"
              />
            ) : (
              <>
                <Input
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-[var(--muted-foreground)]">
                  Harus diawali <code>https://</code> — contoh: https://example.com
                </p>
              </>
            )}
          </div>

          <Button type="submit" disabled={loading || uploading} className="w-full ">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
