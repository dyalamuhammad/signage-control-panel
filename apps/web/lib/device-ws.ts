'use client';

type Status = 'connecting' | 'connected' | 'reconnecting' | 'offline';
type StatusHandler = (s: Status) => void;
type MessageHandler = (msg: any) => void;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export function createDeviceSocket(deviceId: string) {
  let ws: WebSocket | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let backoff = 1000;
  let closed = false;

  const statusHandlers = new Set<StatusHandler>();
  const msgHandlers = new Set<MessageHandler>();

  function setStatus(s: Status) {
    statusHandlers.forEach((h) => h(s));
  }

  function connect() {
    if (closed) return;
    setStatus(ws ? 'reconnecting' : 'connecting');

    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      backoff = 1000;
      setStatus('connected');
      ws?.send(JSON.stringify({ type: 'register', role: 'device', deviceId }));
      pingTimer && clearInterval(pingTimer);
      pingTimer = setInterval(() => {
        if (ws?.readyState === 1) {
          ws.send(JSON.stringify({ type: 'ping', deviceId }));
        }
      }, 5000);
    };

    ws.onmessage = (e) => {
      try {
        msgHandlers.forEach((h) => h(JSON.parse(e.data)));
      } catch {}
    };

    ws.onclose = () => {
      pingTimer && clearInterval(pingTimer);
      pingTimer = null;
      if (closed) {
        setStatus('offline');
        return;
      }
      setStatus('reconnecting');
      reconnectTimer && clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        backoff = Math.min(backoff * 2, 30000);
        connect();
      }, backoff);
    };

    ws.onerror = () => ws?.close();
  }

  connect();

  return {
    onStatus(h: StatusHandler) {
      statusHandlers.add(h);
      return () => statusHandlers.delete(h);
    },
    onMessage(h: MessageHandler) {
      msgHandlers.add(h);
      return () => msgHandlers.delete(h);
    },
    close() {
      closed = true;
      pingTimer && clearInterval(pingTimer);
      reconnectTimer && clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}