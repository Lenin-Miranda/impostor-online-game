'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Health = {
  status: string;
  service: string;
  timestamp: string;
};

export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Health>('/health')
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">⚽ Impostor Fútbol</h1>
        <p className="mt-3 text-lg text-neutral-400">
          El juego del impostor para jugar con tus amigos
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-6 py-4 text-sm">
        <span className="text-neutral-400">Estado del backend: </span>
        {health ? (
          <span className="font-mono text-green-400">
            {health.status} · {health.service}
          </span>
        ) : error ? (
          <span className="font-mono text-red-400">sin conexión ({error})</span>
        ) : (
          <span className="font-mono text-neutral-500">conectando…</span>
        )}
      </div>
    </main>
  );
}
