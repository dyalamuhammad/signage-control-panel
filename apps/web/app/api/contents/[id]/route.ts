import { supabaseServer } from '@/lib/supabase';
import { ok, fail, readJson } from '@/lib/api-helpers';

type Params = { params: Promise<{ id: string }> };
const VALID_TIPE = ['image', 'video', 'text', 'url'] as const;

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await supabaseServer
    .from('contents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return fail(error.message, 404);
  return ok(data);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await readJson<{
    judul?: string;
    tipe?: string;
    payload?: string;
  }>(req);
  if (!body) return fail('body tidak valid');

  const patch: Record<string, unknown> = {};
  if (body.judul !== undefined) {
    if (!body.judul.trim()) return fail('judul tidak boleh kosong');
    patch.judul = body.judul.trim();
  }
  if (body.tipe !== undefined) {
    if (!VALID_TIPE.includes(body.tipe as never)) {
      return fail(`tipe harus salah satu: ${VALID_TIPE.join(', ')}`);
    }
    patch.tipe = body.tipe;
  }
  if (body.payload !== undefined) {
    if (!body.payload.trim()) return fail('payload tidak boleh kosong');
    patch.payload = body.payload.trim();
  }

  if (Object.keys(patch).length === 0) {
    return fail('tidak ada field yang diupdate');
  }

  const { data, error } = await supabaseServer
    .from('contents')
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
    .from('contents')
    .delete()
    .eq('id', id);

  if (error) return fail(error.message, 500);
  return ok({ ok: true });
}