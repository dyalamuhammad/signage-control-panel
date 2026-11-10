import type { WebSocket } from 'ws';

export type ClientRole = 'admin' | 'device';

export type AdminClient = {
  ws: WebSocket;
  role: 'admin';
};

export type DeviceClient = {
  ws: WebSocket;
  role: 'device';
  deviceId: string;
  lastSeen: number;
  lastDbSync?: number;
};

export const admins = new Set<AdminClient>();
export const devices = new Map<string, DeviceClient>(); // key: deviceId

export function addAdmin(ws: WebSocket): AdminClient {
  const c: AdminClient = { ws, role: 'admin' };
  admins.add(c);
  return c;
}

export function addDevice(ws: WebSocket, deviceId: string): DeviceClient {
  // kalau device lama masih konek, tutup yang lama (single connection per device)
  const existing = devices.get(deviceId);
  if (existing && existing.ws !== ws) {
    try {
      existing.ws.close(4000, 'replaced by new connection');
    } catch {}
  }
  const c: DeviceClient = {
    ws,
    role: 'device',
    deviceId,
    lastSeen: Date.now(),
    lastDbSync: Date.now(),
  };
  devices.set(deviceId, c);
  return c;
}

export function removeBySocket(ws: WebSocket) {
  for (const a of admins) {
    if (a.ws === ws) admins.delete(a);
  }
  for (const [id, d] of devices) {
    if (d.ws === ws) devices.delete(id);
  }
}

export function broadcastToAdmins(payload: unknown) {
  const msg = JSON.stringify(payload);
  for (const a of admins) {
    if (a.ws.readyState === 1) {
      try {
        a.ws.send(msg);
      } catch {}
    }
  }
}