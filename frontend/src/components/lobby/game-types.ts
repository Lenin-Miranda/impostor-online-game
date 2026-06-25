export type YourRole =
  | { role: 'crew'; footballer: string }
  | { role: 'impostor'; hint: string | null };

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
