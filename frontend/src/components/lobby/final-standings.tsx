'use client';

import { motion } from 'motion/react';
import { Trophy } from '@phosphor-icons/react';
import type { Standing } from './game-types';

export function FinalStandings({ standings, myId }: { standings: Standing[]; myId: string }) {
  const winner = standings[0];

  return (
    <div className="grid min-h-[100dvh] place-items-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] text-center"
      >
        <p className="font-display text-sm uppercase tracking-[0.2em] text-mute">Fin de la partida</p>

        <div className="mt-6 grid size-16 place-items-center rounded-2xl bg-volt/15 text-volt mx-auto">
          <Trophy weight="fill" className="size-8" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-volt">
          {winner?.nickname ?? '—'}
        </h1>
        <p className="mt-1 text-[15px] text-mute">gana la partida</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface text-left">
          <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
            <span className="font-display text-xs font-medium text-mute">Jugador</span>
            <span className="font-display text-xs font-medium text-mute">Puntos</span>
          </div>
          {standings.map((s, i) => (
            <div
              key={s.playerId}
              className="flex items-center justify-between border-b border-line px-5 py-3 last:border-b-0"
            >
              <span className="flex items-center gap-3">
                <span className="w-5 font-display text-sm text-mute tabular-nums">{i + 1}</span>
                <span className="font-display text-[15px] font-semibold">
                  {s.nickname}
                  {s.playerId === myId && <span className="text-mute"> · tú</span>}
                </span>
              </span>
              <span className="font-display text-[15px] font-bold tabular-nums text-bone">
                {s.score}
              </span>
            </div>
          ))}
        </div>

        <a
          href="/"
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-volt font-display font-medium text-ink transition-colors hover:bg-volt-deep"
        >
          Volver al inicio
        </a>
      </motion.div>
    </div>
  );
}
