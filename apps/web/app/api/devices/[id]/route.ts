import { supabaseServer } from '@/lib/supabase';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { pushContentToDevice } from '@/lib/push';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await supabaseServer
    .from('devices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return fail(error.message, 404);
  return ok(data);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
    const body = await readJson<{
    nama?: string;
    lokasi?: string;
    content_id?: string | null;
    }>(req);
  if (!body) return fail('body tidak valid');

  const patch: Record<string, unknown> = {};
  if (body.nama !== undefined) {
    if (!body.nama.trim()) return fail('nama tidak boleh kosong');
    patch.nama = body.nama.trim();
  }
  if (body.lokasi !== undefined) {
    patch.lokasi = body.lokasi?.trim() || null;
  }

    if (body.content_id !== undefined) {
        patch.content_id = body.content_id; // null untuk clear
    }

  if (Object.keys(patch).length === 0) {
    return fail('tidak ada field yang diupdate');
  }

  const { data, error } = await supabaseServer
    .from('devices')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) return fail(error.message, 500);
  // kalau content_id berubah → push ke device via WS
  if (body.content_id !== undefined) {
    if (body.content_id) {
      const { data: c } = await supabaseServer
        .from('contents')
        .select('*')
        .eq('id', body.content_id)
        .single();
      if (c) await pushContentToDevice(id, c);
    } else {
      await pushContentToDevice(id, null);
    }
  }
  return ok(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const { error } = await supabaseServer
    .from('devices')
    .delete()
    .eq('id', id);

  if (error) return fail(error.message, 500);
  return ok({ ok: true });
}