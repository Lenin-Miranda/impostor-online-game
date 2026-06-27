'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { BrandLogo } from '../ui/brand';
import { LanguageToggle } from '../ui/language-toggle';
import { useI18n } from '@/i18n';

export function SiteNav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: t('nav.howToPlay'), href: '#como-se-juega' },
    { label: t('nav.theGame'), href: '#el-juego' },
    { label: t('nav.theTwist'), href: '#el-twist' },
  ];

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
        <BrandLogo href="#top" />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-mute transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Button href="/jugar">{t('nav.createRoom')}</Button>
        </div>
      </div>
    </motion.header>
  );
}
