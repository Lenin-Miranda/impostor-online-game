'use client';

import type { ReactNode } from 'react';
import { SlidersHorizontal, LockSimple } from '@phosphor-icons/react';
import { Segmented, Toggle, Stepper } from './controls';
import type { Settings } from './types';

// Etiqueta en español, valor igual al que entiende el backend.
const CATEGORIES = [
  { label: 'Estrellas', value: 'Stars' },
  { label: 'LaLiga', value: 'LaLiga' },
  { label: 'Premier', value: 'Premier' },
  { label: 'Mixto', value: 'Mixed' },
];

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
  const currentCategory =
    CATEGORIES.find((c) => c.value === settings.category)?.label ?? settings.category;

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal weight="bold" className="size-5 text-volt" />
          <h2 className="font-display text-lg font-semibold tracking-tight">Configuración</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-mute">
          <LockSimple weight="bold" className="size-3" />
          Solo el anfitrión
        </span>
      </div>

      <div className="mt-2 divide-y divide-line">
        <Row
          label="Impostores"
          hint="Cuántos jugadores reciben solo una pista"
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
          label="Jugador secreto"
          hint="De dónde sale el futbolista de cada ronda"
          stack
          control={
            editable ? (
              <Segmented
                id="seg-categoria"
                value={settings.category}
                onChange={(v) => onChange({ category: v })}
                options={CATEGORIES}
              />
            ) : (
              <ReadOnly>{currentCategory}</ReadOnly>
            )
          }
        />

        <Row
          label="Tiempo por ronda"
          hint="Minutos para debatir antes de votar"
          stack
          control={
            editable ? (
              <Segmented
                id="seg-tiempo"
                value={settings.time}
                onChange={(v) => onChange({ time: v })}
                options={[
                  { label: '3 min', value: 3 },
                  { label: '5 min', value: 5 },
                  { label: '8 min', value: 8 },
                ]}
              />
            ) : (
              <ReadOnly>{settings.time} min</ReadOnly>
            )
          }
        />

        <Row
          label="Pista al impostor"
          hint="Dar una pista vaga en vez de nada"
          control={
            editable ? (
              <Toggle checked={settings.hints} onChange={(v) => onChange({ hints: v })} />
            ) : (
              <ReadOnly>{settings.hints ? 'Sí' : 'No'}</ReadOnly>
            )
          }
        />

        <Row
          label="Máx. jugadores"
          hint="Aforo de la sala"
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
