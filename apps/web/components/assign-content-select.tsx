'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/fetcher';
import type { Content } from '@/lib/types';

type Props = {
  deviceId: string;
  currentContentId: string | null;
  onChanged: () => void;
};

export function AssignContentSelect({ deviceId, currentContentId, onChanged }: Props) {
  const [contents, setContents] = useState<Content[]>([]);
  const [value, setValue] = useState(currentContentId ?? 'none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<Content[]>('/api/contents')
      .then(setContents)
      .catch(() => {});
  }, []);

  async function handleChange(v: string | null) {
    if (!v) return;
    setValue(v);
    try {
      setLoading(true);
      await apiFetch(`/api/devices/${deviceId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content_id: v === 'none' ? null : v,
        }),
      });
      toast.success('Content di-assign');
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
      setValue(currentContentId ?? 'none');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-9">
        <SelectValue placeholder="Pilih content" />
      </SelectTrigger>
      <SelectContent className="bg-[var(--card)] border border-[var(--border)] text-[var(--card-foreground)]">
        <SelectItem value="none">— Kosongkan —</SelectItem>
        {contents.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.judul} ({c.tipe})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
