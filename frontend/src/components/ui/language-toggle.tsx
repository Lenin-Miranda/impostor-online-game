'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/i18n';
import type { Lang } from '@/i18n/dictionaries';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const layoutId = useId();

  const opt = (l: Lang, label: string) => (
    <button
      type="button"
      onClick={() => setLang(l)}
      aria-pressed={lang === l}
      className="relative rounded-full px-2.5 py-1 font-display text-xs font-semibold transition-colors"
    >
      {lang === l && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-full bg-volt"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span className={`relative z-10 ${lang === l ? 'text-ink' : 'text-mute hover:text-bone'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className={`inline-flex rounded-full border border-line bg-ink-2 p-0.5 ${className}`}>
      {opt('es', 'ES')}
      {opt('en', 'EN')}
    </div>
  );
}
