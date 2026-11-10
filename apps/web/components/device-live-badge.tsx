'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { subscribe } from '@/lib/ws-client';

type Props = { deviceId: string; initialStatus: 'online' | 'offline' };

export function DeviceLiveBadge({ deviceId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type === 'device:status' && msg.deviceId === deviceId) {
        setStatus(msg.status);
      }
    });
  }, [deviceId]);

  return (
    <Badge
      variant="outline"
      className={
        status === 'online'
          ? 'border-emerald-600 text-emerald-400'
          : 'border-zinc-600 text-zinc-400'
      }
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
        }`}
      />
      {status}
    </Badge>
  );
}