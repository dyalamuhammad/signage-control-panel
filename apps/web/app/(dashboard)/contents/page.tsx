'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/fetcher';
import type { Content } from '@/lib/types';
import { ContentFormDialog } from '@/components/content-form-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentsPage() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await apiFetch<Content[]>('/api/contents');
      setItems(data);
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
    if (!confirm('Hapus content ini?')) return;
    try {
      await apiFetch(`/api/contents/${id}`, { method: 'DELETE' });
      toast.success('Content dihapus');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contents</h1>
          <p className="text-sm text-zinc-400">
            Konten yang bisa ditampilkan di device
          </p>
        </div>
        <Button
          onClick={() => setOpenForm(true)}
          className=""
        >
          + Tambah Content
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
            >
              <Skeleton className="w-full h-32 rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <div className="text-4xl">🎬</div>
              <div>
                <p className="text-[var(--foreground)] font-medium">
                  Belum ada content
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Upload gambar, video, atau teks untuk ditampilkan di device.
                </p>
              </div>
              <Button onClick={() => setOpenForm(true)}>+ Tambah Content</Button>
            </CardContent>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <Card key={c.id} className="overflow-hidden">
  {c.tipe === 'image' && (
    <img
      src={c.payload}
      alt={c.judul}
      className="w-full h-32 object-cover"
    />
  )}
  {c.tipe === 'video' && (
    <video
      src={c.payload}
      className="w-full h-32 object-cover"
      muted
    />
  )}
  <CardContent className="p-4 space-y-2">
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-medium text-[var(--foreground)] truncate">
        {c.judul}
      </h3>
      <Badge variant="outline" className="shrink-0">
        {c.tipe}
      </Badge>
    </div>
    <p className="text-xs text-[var(--muted-foreground)] truncate">
      {c.payload}
    </p>
    <Button
      size="sm"
      variant="destructive"
      onClick={() => handleDelete(c.id)}
      className="w-full"
    >
      Hapus
    </Button>
  </CardContent>
</Card>
          ))}
        </div>
      )}

      <ContentFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        onSuccess={load}
      />
    </div>
  );
}