import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error('SUPABASE_URL & SUPABASE_SECRET_KEY wajib di-set');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export async function markDeviceStatus(
  deviceId: string,
  status: 'online' | 'offline',
  lastSeenMs: number
) {
  const { error } = await supabase
    .from('devices')
    .update({
      status,
      last_seen: new Date(lastSeenMs).toISOString(),
    })
    .eq('id', deviceId);
  if (error) console.error('[DB] markDeviceStatus', error.message);
}