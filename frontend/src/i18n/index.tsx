'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { es, en, type Lang } from './dictionaries';

const dicts = { es, en };

function resolve(dict: unknown, path: string): string {
  const val = path
    .split('.')
    .reduce<unknown>(
      (o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined),
      dict,
    );
  return typeof val === 'string' ? val : path;
}

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  // Idioma guardado o, si no hay, el del navegador (fallback español).
  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved === 'es' || saved === 'en') {
      setLangState(saved);
    } else if (
      typeof navigator !== 'undefined' &&
      navigator.language.toLowerCase().startsWith('en')
    ) {
      setLangState('en');
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = resolve(dicts[lang], key);
    if (s === key) s = resolve(dicts.es, key); // fallback al español
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    }
    return s;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}
