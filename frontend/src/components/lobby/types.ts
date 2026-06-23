export type Player = {
  id: string;
  name: string;
  host?: boolean;
  you?: boolean;
};

export type Settings = {
  impostores: number;
  categoria: string;
  tiempo: number; // minutos por ronda
  pistas: boolean;
  maxJugadores: number;
};
