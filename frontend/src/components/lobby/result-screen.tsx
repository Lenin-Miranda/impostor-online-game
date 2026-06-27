'use client';

import { motion } from 'motion/react';
import { Detective, Trophy, ArrowRight, FlagCheckered } from '@phosphor-icons/react';
import type { Player } from './types';
import type { RoundResult } from './game-types';

const EASE = [0.16, 1, 0.3, 1] as const;

export function ResultScreen({
  result,
  players,
  isHost,
  myId,
  onNextRound,
  onEndGame,
}: {
  result: RoundResult;
  players: Player[];
  isHost: boolean;
  myId: string;
  onNextRound: () => void;
  onEndGame: () => void;
}) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '—';
  const impostorNames = result.impostorIds.map(nameOf).join(', ');
  const crewWon = result.outcome === 'crew';

  return (
    <div className="grid min-h-[100dvh] place-items-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-[520px] text-center"
      >
        <div
          className={`mx-auto grid size-14 place-items-center rounded-2xl ${
            crewWon ? 'bg-volt/15 text-volt' : 'bg-impostor/15 text-impostor'
          }`}
        >
          {crewWon ? <Trophy weight="fill" className="size-7" /> : <Detective weight="fill" className="size-7" />}
        </div>

        <h1
          className={`mt-6 font-display text-3xl font-bold tracking-tight ${
            crewWon ? 'text-volt' : 'text-impostor'
          }`}
        >
          {crewWon ? '¡Atraparon al impostor!' : 'El impostor sobrevivió'}
        </h1>

        <p className="mt-3 text-[15px] text-mute">
          El impostor era <span className="font-semibold text-bone">{impostorNames}</span>.
          {result.tie && ' La votación quedó en empate.'}
        </p>
        <p className="mt-1 text-[15px] text-mute">
          El jugador secreto era{' '}
          <span className="font-semibold text-bone">{result.secret ?? '—'}</span>.
        </p>

        {/* Marcador */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface text-left">
          <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
            <span className="font-display text-xs font-medium text-mute">Jugador</span>
            <span className="font-display text-xs font-medium text-mute">Puntos</span>
          </div>
          {result.standings.map((s, i) => (
            <div
              key={s.playerId}
              className="flex items-center justify-between border-b border-line px-5 py-3 last:border-b-0"
            >
              <span className="flex items-center gap-3">
                <span className="w-5 font-display text-sm text-mute tabular-nums">{i + 1}</span>
                <span className="font-display text-[15px] font-semibold">
                  {s.nickname}
                  {s.playerId === myId && <span className="text-mute"> · tú</span>}
                  {result.impostorIds.includes(s.playerId) && (
                    <span className="ml-2 text-xs text-impostor">impostor</span>
                  )}
                </span>
              </span>
              <span className="font-display text-[15px] font-bold tabular-nums text-bone">
                {s.score}
              </span>
            </div>
          ))}
        </div>

        {/* Controles del anfitrión */}
        {isHost ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              onClick={onNextRound}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.16, ease: EASE }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-volt font-display font-medium text-ink transition-colors hover:bg-volt-deep"
            >
              Siguiente ronda
              <ArrowRight weight="bold" className="size-[18px]" />
            </motion.button>
            <motion.button
              type="button"
              onClick={onEndGame}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.16, ease: EASE }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line font-display font-medium text-bone transition-colors hover:bg-surface"
            >
              <FlagCheckered weight="bold" className="size-[18px]" />
              Terminar partida
            </motion.button>
          </div>
        ) : (
          <p className="mt-8 text-[13px] text-mute">
            Esperando a que el anfitrión empiece la siguiente ronda…
          </p>
        )}
      </motion.div>
    </div>
  );
}
