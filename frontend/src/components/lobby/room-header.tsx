'use client';

import { useState } from 'react';
import { Copy, Check, SignOut } from '@phosphor-icons/react';
import { motion } from 'motion/react';

export function RoomHeader({ code, count, max }: { code: string; count: number; max: number }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2 font-display text-sm text-mute">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-volt" />
          </span>
          Sala en espera
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-4xl font-bold tracking-[0.12em] sm:text-5xl">{code}</span>
          <button
            type="button"
            onClick={copy}
            className="grid size-10 place-items-center rounded-full border border-line text-mute transition-colors hover:border-bone/40 hover:text-bone"
            aria-label="Copiar código"
          >
            {copied ? <Check weight="bold" className="size-4 text-volt" /> : <Copy weight="bold" className="size-4" />}
          </button>
          <motion.span
            initial={false}
            animate={{ opacity: copied ? 1 : 0 }}
            className="font-display text-sm text-volt"
          >
            ¡Copiado!
          </motion.span>
        </div>

        <p className="mt-2 text-[15px] text-mute">
          Comparte el código con tu grupo. <span className="text-bone">{count}</span> de {max} jugadores dentro.
        </p>
      </div>

      <a
        href="/"
        className="inline-flex items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-sm text-mute transition-colors hover:border-bone/40 hover:text-bone"
      >
        <SignOut weight="bold" className="size-4" />
        Salir
      </a>
    </div>
  );
}
