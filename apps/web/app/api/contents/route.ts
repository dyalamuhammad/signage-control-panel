import { supabaseServer } from '@/lib/supabase';
import { ok, fail, readJson } from '@/lib/api-helpers';

const VALID_TIPE = ['image', 'video', 'text', 'url'] as const;

export async function GET() {
  const { data, error } = await supabaseServer
    .from('contents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function POST(req: Request) {
  const body = await readJson<{
    judul?: string;
    tipe?: string;
    payload?: string;
  }>(req);

  if (!body) return fail('body tidak valid');
  if (!body.judul?.trim()) return fail('judul wajib diisi');
  if (!body.tipe || !VALID_TIPE.includes(body.tipe as never)) {
    return fail(`tipe harus salah satu: ${VALID_TIPE.join(', ')}`);
  }
  if (!body.payload?.trim()) return fail('payload wajib diisi');

  const { data, error } = await supabaseServer
    .from('contents')
    .insert({
      judul: body.judul.trim(),
      tipe: body.tipe,
      payload: body.payload.trim(),
    })
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data, 201);
}