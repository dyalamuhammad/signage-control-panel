import { Suspense } from 'react';
import DeviceClient from './device-client';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Memuat device...</p>
        </div>
      }
    >
      <DeviceClient />
    </Suspense>
  );
}