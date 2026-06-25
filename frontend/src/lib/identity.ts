// Identidad del jugador en una sala: guardamos el playerId que devolvió el
// backend al crear/unirse, para reconocerlo al volver al lobby y reconectar.
export type Identity = { playerId: string; nickname: string };

const key = (code: string) => `impostor:player:${code.toUpperCase()}`;

export function saveIdentity(code: string, identity: Identity) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key(code), JSON.stringify(identity));
}

export function getIdentity(code: string): Identity | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key(code));
  try {
    return raw ? (JSON.parse(raw) as Identity) : null;
  } catch {
    return null;
  }
}

export function clearIdentity(code: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key(code));
}
