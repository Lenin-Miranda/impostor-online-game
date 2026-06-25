'use client';

import { motion } from 'motion/react';
import { Eye, EyeClosed, ArrowRight } from '@phosphor-icons/react';
import type { YourRole } from './game-types';

const EASE = [0.16, 1, 0.3, 1] as const;

export function RoleReveal({
  role,
  code,
  isHost,
  onToVoting,
}: {
  role: YourRole;
  code: string;
  isHost: boolean;
  onToVoting: () => void;
}) {
  const isImpostor = role.role === 'impostor';

  return (
    <div className="grid min-h-[100dvh] place-items-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-[440px] text-center"
      >
        <p className="font-display text-sm uppercase tracking-[0.2em] text-mute">Sala {code}</p>

        <div
          className={`mt-6 rounded-3xl border p-10 ${
            isImpostor
              ? 'border-impostor/40 bg-impostor/5 shadow-[0_0_60px_-20px_var(--color-impostor)]'
              : 'border-volt/40 bg-volt/5 shadow-[0_0_60px_-20px_var(--color-volt)]'
          }`}
        >
          <div
            className={`mx-auto grid size-14 place-items-center rounded-2xl ${
              isImpostor ? 'bg-impostor/15 text-impostor' : 'bg-volt/15 text-volt'
            }`}
          >
            {isImpostor ? (
              <EyeClosed weight="fill" className="size-7" />
            ) : (
              <Eye weight="fill" className="size-7" />
            )}
          </div>

          {isImpostor ? (
            <>
              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-impostor">
                Eres el impostor
              </h1>
              <p className="mt-3 text-[15px] text-mute">
                No sabes el jugador secreto. Disimula y no te delates.
              </p>
              {role.hint && (
                <div className="mt-6 rounded-2xl border border-line bg-ink-2 px-5 py-4">
                  <p className="font-display text-xs uppercase tracking-[0.18em] text-mute">
                    Tu única pista
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-bone">{role.hint}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-mute">
                El jugador secreto es
              </h1>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-volt">
                {role.footballer}
              </p>
              <p className="mt-4 text-[15px] text-mute">
                Da pistas sin ser obvio. Hay un impostor que no lo sabe.
              </p>
            </>
          )}
        </div>

        {/* Control del anfitrión para avanzar a la votación */}
        {isHost ? (
          <motion.button
            type="button"
            onClick={onToVoting}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-volt font-display font-medium text-ink transition-colors hover:bg-volt-deep"
          >
            Pasar a votación
            <ArrowRight weight="bold" className="size-[18px]" />
          </motion.button>
        ) : (
          <p className="mt-6 text-[13px] text-mute">
            Cuando todos lo hayan visto, el anfitrión abre la votación.
          </p>
        )}
      </motion.div>
    </div>
  );
}
