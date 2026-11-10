'use client';

type Handler = (msg: any) => void;

let socket: WebSocket | null = null;
let handlers = new Set<Handler>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let backoff = 1000;
let intentionalClose = false;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

function connect() {
  if (socket && (socket.readyState === 0 || socket.readyState === 1)) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    backoff = 1000;
    socket?.send(JSON.stringify({ type: 'register', role: 'admin' }));
  };

  socket.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      handlers.forEach((h) => h(msg));
    } catch {}
  };

  socket.onclose = () => {
    if (intentionalClose) return;
    reconnectTimer && clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      backoff = Math.min(backoff * 2, 30000);
      connect();
    }, backoff);
  };

  socket.onerror = () => socket?.close();
}

export function subscribe(handler: Handler) {
  handlers.add(handler);
  connect();
  return () => {
    handlers.delete(handler);
  };
}

export function disconnect() {
  intentionalClose = true;
  socket?.close();
  socket = null;
  handlers.clear();
}