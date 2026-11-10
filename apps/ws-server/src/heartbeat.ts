import { devices, broadcastToAdmins } from './rooms.js';
import { markDeviceStatus } from './supabase.js';

const OFFLINE_THRESHOLD = Number(process.env.OFFLINE_THRESHOLD || 15000);
const TICK = 5000;

export function startHeartbeat() {
  setInterval(() => {
    const now = Date.now();
    for (const [id, d] of devices) {
      const diff = now - d.lastSeen;
      if (diff > OFFLINE_THRESHOLD) {
        // tandai offline
        devices.delete(id);
        try {
          d.ws.close(4001, 'heartbeat timeout');
        } catch {}
        broadcastToAdmins({
          type: 'device:status',
          deviceId: id,
          status: 'offline',
          lastSeen: new Date(d.lastSeen).toISOString(),
        });
        markDeviceStatus(id, 'offline', d.lastSeen).catch(() => {});
        console.log(`[HB] ${id} offline`);
      }
    }
  }, TICK);
}