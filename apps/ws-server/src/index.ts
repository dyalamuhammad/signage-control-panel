import 'dotenv/config';
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { addAdmin, addDevice, removeBySocket, broadcastToAdmins, devices } from './rooms.js';
import { startHeartbeat } from './heartbeat.js';
import { markDeviceStatus } from './supabase.js';

const PORT = Number(process.env.PORT || 4000);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, ts: Date.now() }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WS] client connected');

  ws.on('message', (raw) => {
    // parsing minimal dulu — handler lengkap di Langkah 2
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg?.type === 'register' && msg?.role === 'admin') {
      addAdmin(ws);
      ws.send(JSON.stringify({ type: 'registered', role: 'admin' }));
      console.log('[WS] admin registered');
    }
    if (msg?.type === 'register' && msg?.role === 'device' && msg?.deviceId) {
        const d = addDevice(ws, msg.deviceId);
        d.lastSeen = Date.now();
        ws.send(JSON.stringify({ type: 'registered', role: 'device', deviceId: msg.deviceId }));
        broadcastToAdmins({
            type: 'device:status',
            deviceId: msg.deviceId,
            status: 'online',
            lastSeen: new Date(d.lastSeen).toISOString(),
        });
        markDeviceStatus(msg.deviceId, 'online', d.lastSeen).catch(() => {});
        console.log(`[WS] device registered: ${msg.deviceId}`);
        return;
        }

        if (msg?.type === 'ping' && msg?.deviceId) {
        const d = devices.get(msg.deviceId);
        if (d) {
            d.lastSeen = Date.now();
            // update DB tiap ~10s saja, bukan tiap ping
            if (!d.lastDbSync || d.lastSeen - d.lastDbSync > 10000) {
            d.lastDbSync = d.lastSeen;
            markDeviceStatus(msg.deviceId, 'online', d.lastSeen).catch(() => {});
            }
        }
        return;
    }
  });

  ws.on('close', () => {
  // cari apakah socket ini milik device
  let closedDeviceId: string | null = null;
  for (const [id, d] of devices) {
    if (d.ws === ws) { closedDeviceId = id; break; }
  }

  removeBySocket(ws);

  if (closedDeviceId) {
    broadcastToAdmins({
      type: 'device:status',
      deviceId: closedDeviceId,
      status: 'offline',
      lastSeen: new Date().toISOString(),
    });
    markDeviceStatus(closedDeviceId, 'offline', Date.now()).catch(() => {});
    console.log(`[WS] device disconnected → offline: ${closedDeviceId}`);
  }
  console.log('[WS] client disconnected');
});

  ws.on('error', (err) => {
    console.error('[WS] error', err.message);
  });
});

server.listen(PORT, () => {
  console.log(`[WS] listening on :${PORT}`);
});

startHeartbeat();