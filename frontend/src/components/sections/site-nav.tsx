'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

const LINKS = [
  { label: 'Cómo se juega', href: '#como-se-juega' },
  { label: 'El juego', href: '#el-juego' },
  { label: 'El twist', href: '#el-twist' },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 transition-colors duration-300 sm:px-8 ${
          scrolled ? 'border-b border-line bg-ink/80 backdrop-blur-md' : 'border-b border-transparent'
        }`}
      >
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-volt font-display text-sm font-bold text-ink">
            11
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Impostor<span className="text-mute">.fútbol</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-mute transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <Button href="#crear-sala">Crear sala</Button>
      </div>
    </motion.header>
  );
}
