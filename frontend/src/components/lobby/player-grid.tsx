'use client';

import { Crown } from '@phosphor-icons/react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useI18n } from '@/i18n';
import type { Player } from './types';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const item: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 26 } },
};

function PlayerCard({ p }: { p: Player }) {
  const { t } = useI18n();
  return (
    <motion.div
      variants={item}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4"
    >
      <div
        className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-sm font-semibold ${
          p.host ? 'bg-volt text-ink' : 'bg-ink-2 text-bone ring-1 ring-line'
        }`}
      >
        {initials(p.name)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-[15px] font-semibold">
          {p.name}
          {p.you && <span className="text-mute"> · {t('result.you')}</span>}
        </p>
        {p.host ? (
          <span className="mt-0.5 inline-flex items-center gap-1 font-display text-xs text-volt">
            <Crown weight="fill" className="size-3" />
            {t('players.host')}
          </span>
        ) : (
          <span className="mt-0.5 block text-xs text-mute">{t('players.ready')}</span>
        )}
      </div>
    </motion.div>
  );
}

function EmptySlot() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line/70 p-4">
      <div className="size-11 shrink-0 rounded-full border border-dashed border-line" />
      <span className="text-sm text-mute">{t('players.waiting')}</span>
    </div>
  );
}

export function PlayerGrid({ players, max }: { players: Player[]; max: number }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const emptyCount = Math.min(2, Math.max(0, max - players.length));

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">{t('players.title')}</h2>
        <span className="font-display text-sm text-mute tabular-nums">
          {players.length}/{max}
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {players.map((p) => (
          <PlayerCard key={p.id} p={p} />
        ))}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <EmptySlot key={`empty-${i}`} />
        ))}
      </motion.div>
    </div>
  );
}
