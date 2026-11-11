import { supabaseServer } from '@/lib/supabase';
import { ok, fail } from '@/lib/api-helpers';

const BUCKET = 'contents';
const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5 MB (limit Vercel body)
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return fail('form-data tidak valid');

  const file = form.get('file');
  if (!(file instanceof File)) return fail('file wajib dikirim');
  if (file.size > MAX_SIZE) return fail('file maksimal 10MB');
  if (!ALLOWED.includes(file.type)) {
    return fail(`tipe file tidak didukung: ${file.type}`);
  }

  const ext = file.name.split('.').pop() || 'bin';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `uploads/${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await supabaseServer.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });

  if (upErr) return fail(upErr.message, 500);

  const { data: pub } = supabaseServer.storage.from(BUCKET).getPublicUrl(path);

  return ok({ url: pub.publicUrl, path, tipe: file.type }, 201);
}
