'use client';

import type { ReactNode } from 'react';
import { SlidersHorizontal, LockSimple } from '@phosphor-icons/react';
import { Segmented, Toggle, Stepper } from './controls';
import { useI18n } from '@/i18n';
import type { Settings } from './types';

function Row({
  label,
  hint,
  control,
  stack = false,
}: {
  label: string;
  hint: string;
  control: ReactNode;
  stack?: boolean;
}) {
  if (stack) {
    return (
      <div className="py-4">
        <p className="font-display text-[15px] font-medium">{label}</p>
        <p className="mt-0.5 text-[13px] text-mute">{hint}</p>
        <div className="mt-3 overflow-x-auto">{control}</div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="font-display text-[15px] font-medium">{label}</p>
        <p className="mt-0.5 text-[13px] text-mute">{hint}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function ReadOnly({ children }: { children: ReactNode }) {
  return <span className="font-display text-sm text-bone">{children}</span>;
}

export function SettingsPanel({
  settings,
  onChange,
  editable,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  editable: boolean;
}) {
  const { t } = useI18n();

  // Etiqueta traducida, valor igual al que entiende el backend.
  const categories = [
    { label: t('settings.catStars'), value: 'Stars' },
    { label: 'LaLiga', value: 'LaLiga' },
    { label: 'Premier', value: 'Premier' },
    { label: t('settings.catMixed'), value: 'Mixed' },
  ];
  const currentCategory =
    categories.find((c) => c.value === settings.category)?.label ?? settings.category;

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal weight="bold" className="size-5 text-volt" />
          <h2 className="font-display text-lg font-semibold tracking-tight">{t('settings.title')}</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-mute">
          <LockSimple weight="bold" className="size-3" />
          {t('settings.hostOnly')}
        </span>
      </div>

      <div className="mt-2 divide-y divide-line">
        <Row
          label={t('settings.impostorsLabel')}
          hint={t('settings.impostorsHint')}
          control={
            editable ? (
              <Segmented
                id="seg-impostores"
                value={settings.impostors}
                onChange={(v) => onChange({ impostors: v })}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                ]}
              />
            ) : (
              <ReadOnly>{settings.impostors}</ReadOnly>
            )
          }
        />

        <Row
          label={t('settings.secretLabel')}
          hint={t('settings.secretHint')}
          stack
          control={
            editable ? (
              <Segmented
                id="seg-categoria"
                value={settings.category}
                onChange={(v) => onChange({ category: v })}
                options={categories}
              />
            ) : (
              <ReadOnly>{currentCategory}</ReadOnly>
            )
          }
        />

        <Row
          label={t('settings.timeLabel')}
          hint={t('settings.timeHint')}
          stack
          control={
            editable ? (
              <Segmented
                id="seg-tiempo"
                value={settings.time}
                onChange={(v) => onChange({ time: v })}
                options={[
                  { label: `3 ${t('settings.min')}`, value: 3 },
                  { label: `5 ${t('settings.min')}`, value: 5 },
                  { label: `8 ${t('settings.min')}`, value: 8 },
                ]}
              />
            ) : (
              <ReadOnly>
                {settings.time} {t('settings.min')}
              </ReadOnly>
            )
          }
        />

        <Row
          label={t('settings.hintLabel')}
          hint={t('settings.hintHint')}
          control={
            editable ? (
              <Toggle checked={settings.hints} onChange={(v) => onChange({ hints: v })} />
            ) : (
              <ReadOnly>{settings.hints ? t('settings.yes') : t('settings.no')}</ReadOnly>
            )
          }
        />

        <Row
          label={t('settings.maxLabel')}
          hint={t('settings.maxHint')}
          control={
            editable ? (
              <Stepper
                value={settings.maxPlayers}
                onChange={(v) => onChange({ maxPlayers: v })}
                min={4}
                max={12}
              />
            ) : (
              <ReadOnly>{settings.maxPlayers}</ReadOnly>
            )
          }
        />
      </div>
    </section>
  );
}
