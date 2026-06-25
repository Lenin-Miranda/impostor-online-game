export type Player = {
  id: string;
  name: string;
  host?: boolean;
  you?: boolean;
};

// Mismas claves que el backend (room.settings).
export type Settings = {
  impostors: number;
  category: string;
  time: number; // minutos por ronda
  hints: boolean;
  maxPlayers: number;
};
