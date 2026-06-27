'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';
import { roomsApi, type ApiPlayer } from '@/lib/api';
import { BrandIcon } from '../ui/brand';

export function JoinForm({
  code,
  onJoined,
}: {
  code: string;
  onJoined: (code: string, player: ApiPlayer) => void;
}) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nickname.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { player } = await roomsApi.join(code, nickname.trim());
      onJoined(code, player);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar a la sala.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-5">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-[calc(100vw-4rem)] max-w-[400px]"
      >
        <BrandIcon className="mb-8 h-14 w-14 shadow-[0_20px_60px_-24px_var(--color-volt)]" />
        <p className="font-display text-sm uppercase tracking-[0.2em] text-volt">Sala {code}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Entra a la sala</h1>
        <p className="mt-2 text-[15px] text-mute">Elige un nombre para que tu grupo te reconozca.</p>

        <label htmlFor="nickname" className="mt-8 block text-sm text-mute">
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
          {loading ? 'Entrando…' : 'Entrar'}
          {!loading && <ArrowRight weight="bold" className="size-[18px]" />}
        </button>
      </motion.form>
    </div>
  );
}
