'use client';

import type { ReactNode } from 'react';
import { SlidersHorizontal, LockSimple } from '@phosphor-icons/react';
import { Segmented, Toggle, Stepper } from './controls';
import type { Settings } from './types';

const CATEGORIAS = ['Estrellas', 'LaLiga', 'Premier', 'Mixto'];

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
                value={settings.impostores}
                onChange={(v) => onChange({ impostores: v })}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                ]}
              />
            ) : (
              <ReadOnly>{settings.impostores}</ReadOnly>
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
                value={settings.categoria}
                onChange={(v) => onChange({ categoria: v })}
                options={CATEGORIAS.map((c) => ({ label: c, value: c }))}
              />
            ) : (
              <ReadOnly>{settings.categoria}</ReadOnly>
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
                value={settings.tiempo}
                onChange={(v) => onChange({ tiempo: v })}
                options={[
                  { label: '3 min', value: 3 },
                  { label: '5 min', value: 5 },
                  { label: '8 min', value: 8 },
                ]}
              />
            ) : (
              <ReadOnly>{settings.tiempo} min</ReadOnly>
            )
          }
        />

        <Row
          label="Pista al impostor"
          hint="Dar una pista vaga en vez de nada"
          control={
            editable ? (
              <Toggle checked={settings.pistas} onChange={(v) => onChange({ pistas: v })} />
            ) : (
              <ReadOnly>{settings.pistas ? 'Sí' : 'No'}</ReadOnly>
            )
          }
        />

        <Row
          label="Máx. jugadores"
          hint="Aforo de la sala"
          control={
            editable ? (
              <Stepper
                value={settings.maxJugadores}
                onChange={(v) => onChange({ maxJugadores: v })}
                min={4}
                max={12}
              />
            ) : (
              <ReadOnly>{settings.maxJugadores}</ReadOnly>
            )
          }
        />
      </div>
    </section>
  );
}
