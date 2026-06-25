'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Hourglass } from '@phosphor-icons/react';
import { RoomHeader } from './room-header';
import { PlayerGrid } from './player-grid';
import { SettingsPanel } from './settings-panel';
import { RoleReveal } from './role-reveal';
import { JoinForm } from './join-form';
import type { Player, Settings } from './types';
import { roomsApi, type ApiRoomWithPlayers, type ApiPlayer } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { getIdentity, saveIdentity } from '@/lib/identity';

type YourRole =
  | { role: 'crew'; footballer: string }
  | { role: 'impostor'; hint: string | null };

const DEFAULT_SETTINGS: Settings = {
  impostors: 1,
  category: 'Stars',
  time: 5,
  hints: true,
  maxPlayers: 10,
};

function toPlayers(room: ApiRoomWithPlayers, myId: string | null): Player[] {
  return [...room.players]
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
    .map((p) => ({ id: p.id, name: p.nickname, host: p.is_host, you: p.id === myId }));
}

export function Lobby({ code }: { code: string }) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<ApiRoomWithPlayers | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [role, setRole] = useState<YourRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. ¿Tenemos identidad guardada para esta sala?
  useEffect(() => {
    setPlayerId(getIdentity(code)?.playerId ?? null);
  }, [code]);

  // 2. Con identidad: cargar la sala + conectar el socket en vivo.
  useEffect(() => {
    if (!playerId) return;
    let active = true;

    roomsApi
      .get(code)
      .then((r) => {
        if (!active) return;
        setRoom(r);
        setSettings(r.settings);
      })
      .catch((e) => active && setError(e.message));

    const socket = getSocket();
    const join = () => socket.emit('joinRoom', { code, playerId });
    if (socket.connected) join();

    socket.on('connect', join);
    socket.on('roomUpdated', (r: ApiRoomWithPlayers) => setRoom(r));
    socket.on('yourRole', (payload: YourRole) => setRole(payload));

    return () => {
      active = false;
      socket.off('connect', join);
      socket.off('roomUpdated');
      socket.off('yourRole');
    };
  }, [playerId, code]);

  const players = useMemo(() => (room ? toPlayers(room, playerId) : []), [room, playerId]);
  const isAdmin = !!room && !!playerId && room.host_player_id === playerId;
  const canStart = players.length >= 3;

  function handleJoined(_code: string, player: ApiPlayer) {
    saveIdentity(code, { playerId: player.id, nickname: player.nickname });
    setPlayerId(player.id);
  }

  function patchSettings(patch: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  function startGame() {
    getSocket().emit('startGame', { code });
  }

  // Sin identidad → formulario para entrar.
  if (!playerId) {
    return <JoinForm code={code} onJoined={handleJoined} />;
  }

  // Rol recibido → pantalla de reparto.
  if (role) {
    return <RoleReveal role={role} code={code} />;
  }

  // Error cargando la sala.
  if (error) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-5 text-center">
        <div>
          <p className="font-display text-2xl font-bold">No se pudo cargar la sala</p>
          <p className="mt-2 text-mute">{error}</p>
          <a href="/" className="mt-6 inline-block text-volt underline">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
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
        <RoomHeader code={code} count={players.length} max={settings.maxPlayers} />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <PlayerGrid players={players} max={settings.maxPlayers} />

          <aside className="flex flex-col gap-4">
            <SettingsPanel settings={settings} onChange={patchSettings} editable={isAdmin} />

            {isAdmin ? (
              <div>
                <motion.button
                  type="button"
                  onClick={startGame}
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
                    ? 'Repartirá un jugador secreto y al impostor.'
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
