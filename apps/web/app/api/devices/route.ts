import { supabaseServer } from '@/lib/supabase';
import { ok, fail, readJson } from '@/lib/api-helpers';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('devices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function POST(req: Request) {
  const body = await readJson<{ nama?: string; lokasi?: string }>(req);
  if (!body || !body.nama?.trim()) {
    return fail('nama wajib diisi');
  }

  const { data, error } = await supabaseServer
    .from('devices')
    .insert({
      nama: body.nama.trim(),
      lokasi: body.lokasi?.trim() || null,
    })
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data, 201);
}