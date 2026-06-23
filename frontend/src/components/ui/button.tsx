'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

type Variant = 'primary' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-display font-medium tracking-tight whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:ring-offset-ink';

const sizes = {
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base',
};

const variants: Record<Variant, string> = {
  primary: 'bg-volt text-ink hover:bg-volt-deep',
  ghost: 'border border-line text-bone hover:border-bone/40 hover:bg-surface',
};

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: 'md' | 'lg';
}) {
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
    >
      {children}
    </motion.a>
  );
}
