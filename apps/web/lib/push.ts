import type { Content } from './types';

export async function pushContentToDevice(
  deviceId: string,
  content: Content | null
) {
  const url = process.env.WS_PUSH_URL;
  const secret = process.env.WS_PUSH_SECRET;
  if (!url || !secret) return;

  try {
    console.log('[PUSH] url?', !!url, 'secret?', !!secret);
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-push-secret': secret,
      },
      body: JSON.stringify({
        deviceId,
        contentId: content?.id ?? null,
        payload: content,
      }),
    });
  } catch {
    // device mungkin offline — abaikan, bukan error fatal
  }
}