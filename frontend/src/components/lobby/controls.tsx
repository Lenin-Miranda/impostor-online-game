'use client';

import { Minus, Plus } from '@phosphor-icons/react';
import { motion } from 'motion/react';

type Option<T> = { label: string; value: T };

/** Selector segmentado con indicador deslizante (layout animation). */
export function Segmented<T extends string | number>({
  id,
  options,
  value,
  onChange,
  disabled = false,
}: {
  id: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`inline-flex rounded-full border border-line bg-ink-2 p-1 ${
        disabled ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative rounded-full px-3.5 py-1.5 font-display text-[13px] font-medium transition-colors"
          >
            {active && (
              <motion.span
                layoutId={id}
                className="absolute inset-0 rounded-full bg-volt"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className={`relative z-10 ${active ? 'text-ink' : 'text-mute hover:text-bone'}`}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Interruptor on/off. */
export function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-200 disabled:opacity-50 ${
        checked ? 'justify-end bg-volt' : 'justify-start bg-line'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        className={`size-5 rounded-full ${checked ? 'bg-ink' : 'bg-bone'}`}
      />
    </button>
  );
}

/** Contador con botones − / +. */
export function Stepper({
  value,
  onChange,
  min,
  max,
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
}) {
  const btn =
    'grid size-8 place-items-center rounded-full text-bone transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30';
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-ink-2 p-1 ${
        disabled ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Restar">
        <Minus weight="bold" className="size-4" />
      </button>
      <span className="w-7 text-center font-display text-[15px] font-semibold tabular-nums">{value}</span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Sumar">
        <Plus weight="bold" className="size-4" />
      </button>
    </div>
  );
}
