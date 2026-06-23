'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ScrambleText } from '../ui/scramble';

type Chip = {
  n: number;
  name: string;
  top: string;
  left: string;
  impostor?: boolean;
};

// Alineación 3-3-2: fichas dispuestas como en un pizarrón táctico.
const CHIPS: Chip[] = [
  { n: 9, name: 'Leo', top: '20%', left: '36%' },
  { n: 7, name: 'Vini', top: '20%', left: '66%' },
  { n: 8, name: 'Pedri', top: '46%', left: '22%' },
  { n: 10, name: 'IMPOSTOR', top: '46%', left: '50%', impostor: true },
  { n: 6, name: 'Rodri', top: '46%', left: '78%' },
  { n: 4, name: 'Dani', top: '72%', left: '32%' },
  { n: 3, name: 'Nico', top: '72%', left: '68%' },
  { n: 1, name: 'Iker', top: '92%', left: '50%' },
];

const board: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};

const chip: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 14 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 22 },
  },
};

export function FormationBoard() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={reduce ? undefined : board}
      initial={reduce ? false : 'hidden'}
      animate={reduce ? false : 'show'}
      className="relative aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-ink-2 to-ink"
    >
      {/* Líneas del campo */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line" />
        <div className="absolute inset-3 rounded-xl border border-line/60" />
      </div>

      {/* Etiqueta de sala */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 font-display text-xs text-mute">
        <span className="h-1.5 w-1.5 rounded-full bg-volt" />
        SALA · 7K2P9
      </div>

      {CHIPS.map((c) => (
        <motion.div
          key={c.n}
          variants={reduce ? undefined : chip}
          style={{ top: c.top, left: c.left }}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
        >
          {c.impostor ? (
            <div className="flex items-center gap-2 rounded-full border border-impostor/60 bg-impostor/10 px-2.5 py-1.5 shadow-[0_0_24px_-6px_var(--color-impostor)]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-impostor font-display text-[11px] font-bold text-ink">
                {c.n}
              </span>
              <ScrambleText
                text={c.name}
                loop
                className="font-display text-xs font-semibold tracking-wide text-impostor"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface/90 px-2.5 py-1.5 backdrop-blur-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-bone font-display text-[11px] font-bold text-ink">
                {c.n}
              </span>
              <span className="font-display text-xs font-semibold tracking-wide text-bone">
                {c.name}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
