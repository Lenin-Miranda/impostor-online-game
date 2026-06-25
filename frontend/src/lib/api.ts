const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ── Tipos que devuelve el backend ──────────────────────────────
export type ApiSettings = {
  impostors: number;
  category: string;
  time: number;
  hints: boolean;
  maxPlayers: number;
};

export type ApiPlayer = {
  id: string;
  room_id: string;
  nickname: string;
  is_host: boolean;
  connected: boolean;
  score: number;
  joined_at: string;
};

export type ApiRoom = {
  id: string;
  code: string;
  status: 'lobby' | 'in_game' | 'finished';
  host_player_id: string | null;
  settings: ApiSettings;
  created_at: string;
  updated_at: string;
};

/** GET /rooms/:code trae la sala con sus jugadores embebidos. */
export type ApiRoomWithPlayers = ApiRoom & { players: ApiPlayer[] };

/** create y join devuelven { room, player }. */
export type RoomAndPlayer = { room: ApiRoom; player: ApiPlayer };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    // El backend manda { message, error, statusCode }; sacamos el message legible.
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── API del dominio de salas ───────────────────────────────────
export const roomsApi = {
  create: (nickname: string) => apiPost<RoomAndPlayer>('/rooms', { nickname }),
  join: (code: string, nickname: string) =>
    apiPost<RoomAndPlayer>(`/rooms/${code}/join`, { nickname }),
  get: (code: string) => apiGet<ApiRoomWithPlayers>(`/rooms/${code}`),
};
