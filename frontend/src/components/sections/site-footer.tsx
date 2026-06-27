'use client';

import { BrandLogo } from '../ui/brand';
import { LanguageToggle } from '../ui/language-toggle';
import { useI18n } from '@/i18n';

export function SiteFooter() {
  const { t } = useI18n();

  const links = [
    { label: t('nav.howToPlay'), href: '#como-se-juega' },
    { label: t('nav.theGame'), href: '#el-juego' },
    { label: t('nav.theTwist'), href: '#el-twist' },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <BrandLogo />

        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-mute transition-colors hover:text-bone">
              {l.label}
            </a>
          ))}
          <LanguageToggle />
        </nav>

        <p className="text-sm text-mute">
          {t('footer.madeFor')} · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
