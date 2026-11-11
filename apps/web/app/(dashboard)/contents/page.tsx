'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/fetcher';
import type { Content } from '@/lib/types';
import { ContentFormDialog } from '@/components/content-form-dialog';

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
        <p className="text-zinc-500 text-sm">Memuat...</p>
      ) : items.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center text-zinc-400 text-sm">
            Belum ada content. Klik "Tambah Content" untuk mulai.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <Card key={c.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
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
                  <h3 className="font-medium text-zinc-100 truncate">
                    {c.judul}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-zinc-600 text-zinc-400 shrink-0"
                  >
                    {c.tipe}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 truncate">{c.payload}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(c.id)}
                  className="border-rose-800 text-rose-400 hover:bg-rose-950 w-full"
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