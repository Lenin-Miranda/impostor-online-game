'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';
import { roomsApi } from '@/lib/api';
import { saveIdentity } from '@/lib/identity';

type Mode = 'create' | 'join';

export default function JugarPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('create');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (nickname.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (mode === 'join' && code.trim().length < 4) {
      setError('Escribe el código de la sala.');
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === 'create'
          ? await roomsApi.create(nickname.trim())
          : await roomsApi.join(code.trim().toUpperCase(), nickname.trim());
      const roomCode = result.room.code;
      saveIdentity(roomCode, { playerId: result.player.id, nickname: result.player.nickname });
      router.push(`/sala/${roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal.');
      setLoading(false);
    }
  }

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        setError(null);
      }}
      className={`relative flex-1 rounded-full py-2 font-display text-sm font-medium transition-colors ${
        mode === m ? 'text-ink' : 'text-mute hover:text-bone'
      }`}
    >
      {mode === m && (
        <motion.span
          layoutId="jugar-tab"
          className="absolute inset-0 rounded-full bg-volt"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <div className="grid min-h-[100dvh] place-items-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px]"
      >
        <a href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-volt font-display text-sm font-bold text-ink">
            11
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Impostor<span className="text-mute">.fútbol</span>
          </span>
        </a>

        <div className="mt-8 flex rounded-full border border-line bg-ink-2 p-1">
          {tab('create', 'Crear sala')}
          {tab('join', 'Unirse')}
        </div>

        <form onSubmit={submit} className="mt-6">
          {mode === 'join' && (
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm text-mute">
                Código de la sala
              </label>
              <input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={5}
                placeholder="Ej. 7K2P9"
                className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 font-display text-lg tracking-[0.2em] text-bone outline-none transition-colors placeholder:tracking-normal placeholder:text-mute focus:border-volt"
              />
            </div>
          )}

          <label htmlFor="nickname" className="block text-sm text-mute">
            Tu nombre
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            autoFocus
            placeholder="Ej. Lenin"
            className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 font-display text-[15px] text-bone outline-none transition-colors placeholder:text-mute focus:border-volt"
          />

          {error && <p className="mt-3 text-sm text-impostor">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-volt font-display font-medium text-ink transition-colors hover:bg-volt-deep disabled:opacity-50"
          >
            {loading ? 'Un momento…' : mode === 'create' ? 'Crear sala' : 'Entrar'}
            {!loading && <ArrowRight weight="bold" className="size-[18px]" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
