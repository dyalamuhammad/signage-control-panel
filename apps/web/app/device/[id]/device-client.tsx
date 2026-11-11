'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createDeviceSocket } from '@/lib/device-ws';
import type { Content, Device } from '@/lib/types';

type ConnStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline';

export default function DeviceClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [device, setDevice] = useState<Device | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [connStatus, setConnStatus] = useState<ConnStatus>('connecting');
  const [error, setError] = useState('');
  const socketRef = useRef<ReturnType<typeof createDeviceSocket> | null>(null);

  // fetch device + content
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/devices/${id}`);
        if (!res.ok) throw new Error('Device tidak ditemukan');
        const d: Device = await res.json();
        if (cancelled) return;
        setDevice(d);

        if (d.content_id) {
          const cres = await fetch(`/api/contents/${d.content_id}`);
          if (cres.ok) {
            const c: Content = await cres.json();
            if (!cancelled) setContent(c);
          }
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // connect WS
  useEffect(() => {
    if (!device) return;
    const sock = createDeviceSocket(device.id);
    socketRef.current = sock;

    const unsubStatus = sock.onStatus(setConnStatus);
    const unsubMsg = sock.onMessage((msg) => {
      if (msg.type === 'command:push' && msg.payload) {
        setContent(msg.payload ?? null);
      }
    });

    return () => {
      unsubStatus();
      unsubMsg();
      sock.close();
    };
  }, [device]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-rose-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {!content ? (
          <p className="text-zinc-500 text-sm">Belum ada content</p>
        ) : content.tipe === 'text' ? (
          <p className="text-4xl md:text-6xl font-semibold text-center px-8 whitespace-pre-wrap">
            {content.payload}
          </p>
        ) : content.tipe === 'image' ? (
          <img
            src={content.payload}
            alt={content.judul}
            className="w-full h-full object-contain"
          />
        ) : content.tipe === 'video' ? (
          <video
            src={content.payload}
            className="w-full h-full object-contain"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <iframe
            src={content.payload}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs">
        <span
          className={`w-2 h-2 rounded-full ${
            connStatus === 'connected'
              ? 'bg-emerald-400 animate-pulse'
              : connStatus === 'reconnecting'
                ? 'bg-amber-400 animate-pulse'
                : connStatus === 'connecting'
                  ? 'bg-zinc-400'
                  : 'bg-rose-500'
          }`}
        />
        <span className="text-zinc-300 capitalize">{connStatus}</span>
      </div>
    </div>
  );
}