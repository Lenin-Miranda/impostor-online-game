'use client';

import { motion } from 'motion/react';
import { Check } from '@phosphor-icons/react';
import { useI18n } from '@/i18n';
import type { Player } from './types';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function VotingScreen({
  players,
  myId,
  myVote,
  voteProgress,
  onVote,
}: {
  players: Player[];
  myId: string;
  myVote: string | null;
  voteProgress: { voted: number; total: number } | null;
  onVote: (targetId: string) => void;
}) {
  const { t } = useI18n();
  const others = players.filter((p) => p.id !== myId);

  return (
    <div className="grid min-h-[100dvh] place-items-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[560px]"
      >
        <p className="font-display text-sm uppercase tracking-[0.2em] text-volt">
          {t('voting.eyebrow')}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{t('voting.title')}</h1>
        <p className="mt-2 text-[15px] text-mute">{t('voting.sub')}</p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {others.map((p) => {
            const selected = myVote === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onVote(p.id)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? 'border-volt bg-volt/10'
                    : 'border-line bg-surface hover:border-bone/30'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-ink-2 font-display text-xs font-semibold text-bone ring-1 ring-line">
                    {initials(p.name)}
                  </span>
                  <span className="font-display text-[15px] font-semibold">{p.name}</span>
                </span>
                {selected && <Check weight="bold" className="size-5 text-volt" />}
              </button>
            );
          })}
        </div>

        <p className="mt-7 text-center text-sm text-mute">
          {voteProgress
            ? t('voting.progress', { voted: voteProgress.voted, total: voteProgress.total })
            : myVote
              ? t('voting.voted')
              : t('voting.notVoted')}
        </p>
      </motion.div>
    </div>
  );
}
