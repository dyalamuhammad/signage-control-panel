import { supabaseServer } from '@/lib/supabase';
import { ok, fail, readJson } from '@/lib/api-helpers';

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
  const body = await readJson<{ nama?: string; lokasi?: string }>(req);
  if (!body) return fail('body tidak valid');

  const patch: Record<string, unknown> = {};
  if (body.nama !== undefined) {
    if (!body.nama.trim()) return fail('nama tidak boleh kosong');
    patch.nama = body.nama.trim();
  }
  if (body.lokasi !== undefined) {
    patch.lokasi = body.lokasi?.trim() || null;
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