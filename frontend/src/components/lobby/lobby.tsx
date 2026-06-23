'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Hourglass } from '@phosphor-icons/react';
import { RoomHeader } from './room-header';
import { PlayerGrid } from './player-grid';
import { SettingsPanel } from './settings-panel';
import type { Player, Settings } from './types';

// ── Mock: esto vendrá del backend (jugadores en tiempo real, roles, etc.) ──
const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Lenin', host: true, you: true },
  { id: '2', name: 'Marcos' },
  { id: '3', name: 'Sofía' },
  { id: '4', name: 'Diego' },
  { id: '5', name: 'Valentina' },
  { id: '6', name: 'Mateo' },
];

const DEFAULT_SETTINGS: Settings = {
  impostores: 1,
  categoria: 'Estrellas',
  tiempo: 5,
  pistas: true,
  maxJugadores: 10,
};

export function Lobby({ code }: { code: string }) {
  // Fijo en true para previsualizar la vista de anfitrión.
  // Roles y permisos reales llegan con el backend.
  const [isAdmin] = useState(true);
  const [players] = useState<Player[]>(MOCK_PLAYERS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const canStart = players.length >= 3;

  function patchSettings(patch: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Mini cabecera */}
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-volt font-display text-sm font-bold text-ink">
              11
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight">
              Impostor<span className="text-mute">.fútbol</span>
            </span>
          </a>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 sm:py-14"
      >
        <RoomHeader code={code} count={players.length} max={settings.maxJugadores} />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <PlayerGrid players={players} max={settings.maxJugadores} />

          <aside className="flex flex-col gap-4">
            <SettingsPanel settings={settings} onChange={patchSettings} editable={isAdmin} />

            {isAdmin ? (
              <div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={!canStart}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-volt font-display font-medium text-ink transition-colors hover:bg-volt-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Play weight="fill" className="size-[18px]" />
                  Empezar partida
                </motion.button>
                <p className="mt-3 text-center text-[13px] text-mute">
                  {canStart
                    ? 'Repartirá los roles cuando conectemos el backend.'
                    : 'Necesitas al menos 3 jugadores para empezar.'}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-5">
                <Hourglass weight="bold" className="size-5 text-volt" />
                <p className="text-[15px] text-mute">
                  Esperando a que el anfitrión empiece la partida…
                </p>
              </div>
            )}
          </aside>
        </div>
      </motion.main>
    </div>
  );
}
