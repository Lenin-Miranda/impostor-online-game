export type Hint = { es: string; en: string };

export type YourRole =
  | { role: 'crew'; footballer: string }
  | { role: 'impostor'; hint: Hint | null };

export type Standing = { playerId: string; nickname: string; score: number };

export type RoundResult = {
  roundId: string;
  phase: 'result';
  secret: string | null;
  impostorIds: string[];
  ejectedId: string | null;
  tie: boolean;
  caught: boolean;
  outcome: 'crew' | 'impostor';
  votes: { voterId: string; targetId: string }[];
  standings: Standing[];
};

export type GameEnded = { status: 'finished'; standings: Standing[] };

export type Phase = 'reveal' | 'voting' | 'result';

// Snapshot privado que el backend manda al (re)conectar, para restaurar pantalla.
export type GameStateSnapshot = {
  status: 'lobby' | 'in_game' | 'finished';
  phase?: Phase;
  role?: YourRole | null;
  result?: RoundResult | null;
  standings?: Standing[];
};
