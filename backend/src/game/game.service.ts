import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { RoomsService } from "src/rooms/rooms.service";
import { SupabaseService } from "src/supabase/supabase.service";

type RoomPlayer = { id: string; nickname: string; score: number };

@Injectable()
export class GameService {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /** Fisher-Yates: returns a shuffled copy (does not mutate the input). */
  private shuffle<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /** Latest round of a room (highest number), or null if it has none. */
  private async getCurrentRound(roomId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from("rounds")
      .select("*")
      .eq("room_id", roomId)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  /**
   * Core of a round: pick the secret footballer, create the round and
   * assign roles (impostors + crew). Shared by startGame and nextRound.
   */
  private async createRoundAndAssign(room: any) {
    const supabase = this.supabaseService.getClient();
    const players = (room.players ?? []) as Array<{ id: string }>;
    const impostors = room.settings.impostors as number;

    // 1. Pick the secret footballer
    const { data: pool, error: poolError } = await supabase
      .from("footballers")
      .select("id, name, league, hint");
    if (poolError) throw new InternalServerErrorException(poolError.message);
    if (!pool || pool.length === 0) {
      throw new InternalServerErrorException("Footballers catalog is empty");
    }
    const secret = pool[Math.floor(Math.random() * pool.length)];

    // 2. Next round number
    const { count, error: countError } = await supabase
      .from("rounds")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);
    if (countError) throw new InternalServerErrorException(countError.message);
    const number = (count ?? 0) + 1;

    // 3. Create the round (assignments reference it via FK)
    const { data: round, error: roundError } = await supabase
      .from("rounds")
      .insert({
        room_id: room.id,
        number,
        footballer_id: secret.id,
        category: room.settings.category,
        phase: "reveal",
      })
      .select()
      .single();
    if (roundError) throw new InternalServerErrorException(roundError.message);

    // 4. Assign roles: shuffle, the first N are impostors
    const shuffled = this.shuffle(players);
    const assignments = shuffled.map((player, i) => ({
      round_id: round.id,
      player_id: player.id,
      role: i < impostors ? "impostor" : "crew",
      hint: i < impostors && room.settings.hints ? secret.hint : null,
    }));

    const { error: assignError } = await supabase
      .from("assignments")
      .insert(assignments);
    if (assignError) throw new InternalServerErrorException(assignError.message);

    return {
      roundId: round.id,
      number,
      secret: secret.name as string,
      roles: assignments.map((a) => ({
        player_id: a.player_id,
        role: a.role,
        hint: a.hint,
      })),
    };
  }

  /** First round of a match: validate the lobby, assign roles, go in_game. */
  async startGame(code: string) {
    const supabase = this.supabaseService.getClient();
    const room = await this.roomsService.getRoom(code);
    const players = (room.players ?? []) as Array<{ id: string }>;
    const impostors = room.settings.impostors as number;

    if (room.status !== "lobby") {
      throw new ConflictException("Game already started");
    }
    if (players.length < 3) {
      throw new ConflictException("Need at least 3 players to start");
    }
    if (impostors >= players.length) {
      throw new ConflictException("Too many impostors for the number of players");
    }

    const result = await this.createRoundAndAssign(room);

    const { error: statusError } = await supabase
      .from("rooms")
      .update({ status: "in_game" })
      .eq("id", room.id);
    if (statusError) throw new InternalServerErrorException(statusError.message);

    return result;
  }

  /** Host moves the current round from 'reveal' to 'voting'. */
  async advanceToVoting(code: string) {
    const room = await this.roomsService.getRoom(code);
    const round = await this.getCurrentRound(room.id);

    if (!round) throw new ConflictException("No active round");
    if (round.phase !== "reveal") {
      throw new ConflictException(`Cannot go to voting from '${round.phase}'`);
    }

    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from("rounds")
      .update({ phase: "voting" })
      .eq("id", round.id);
    if (error) throw new InternalServerErrorException(error.message);

    return { roundId: round.id as string, phase: "voting" as const };
  }

  /**
   * A player votes for a suspect. When everyone has voted, the round
   * result is computed automatically.
   */
  async castVote(code: string, voterId: string, targetId: string) {
    const room = await this.roomsService.getRoom(code);
    const players = (room.players ?? []) as RoomPlayer[];
    const round = await this.getCurrentRound(room.id);

    if (!round) throw new ConflictException("No active round");
    if (round.phase !== "voting") {
      throw new ConflictException("The room is not in the voting phase");
    }
    if (!players.some((p) => p.id === targetId)) {
      throw new ConflictException("Invalid vote target");
    }

    const supabase = this.supabaseService.getClient();
    // upsert: a player can change their vote until everyone has voted.
    const { error } = await supabase
      .from("votes")
      .upsert(
        { round_id: round.id, voter_id: voterId, target_id: targetId },
        { onConflict: "round_id,voter_id" },
      );
    if (error) throw new InternalServerErrorException(error.message);

    const { count, error: countError } = await supabase
      .from("votes")
      .select("voter_id", { count: "exact", head: true })
      .eq("round_id", round.id);
    if (countError) throw new InternalServerErrorException(countError.message);

    const voted = count ?? 0;
    const total = players.length;

    if (voted >= total) {
      const result = await this.computeResult(round, players);
      return { complete: true as const, result };
    }
    return { complete: false as const, voted, total };
  }

  /** Tally votes, decide the outcome, update scores and reveal everything. */
  private async computeResult(round: any, players: RoomPlayer[]) {
    const supabase = this.supabaseService.getClient();

    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("voter_id, target_id")
      .eq("round_id", round.id);
    if (votesError) throw new InternalServerErrorException(votesError.message);

    const { data: assignments, error: assignError } = await supabase
      .from("assignments")
      .select("player_id, role")
      .eq("round_id", round.id);
    if (assignError) throw new InternalServerErrorException(assignError.message);

    const impostorIds = (assignments ?? [])
      .filter((a) => a.role === "impostor")
      .map((a) => a.player_id as string);

    // Tally votes per target.
    const tally = new Map<string, number>();
    for (const v of votes ?? []) {
      tally.set(v.target_id, (tally.get(v.target_id) ?? 0) + 1);
    }

    // Most voted (null on a tie => nobody is ejected).
    let ejectedId: string | null = null;
    let max = 0;
    let tie = false;
    for (const [pid, c] of tally) {
      if (c > max) {
        max = c;
        ejectedId = pid;
        tie = false;
      } else if (c === max) {
        tie = true;
      }
    }
    if (tie) ejectedId = null;

    const caught = ejectedId !== null && impostorIds.includes(ejectedId);
    const outcome: "crew" | "impostor" = caught ? "crew" : "impostor";

    // Scoring: crew caught the impostor -> +1 each crew; impostor survives -> +2.
    const deltas = new Map<string, number>();
    if (caught) {
      for (const p of players) {
        if (!impostorIds.includes(p.id)) deltas.set(p.id, 1);
      }
    } else {
      for (const id of impostorIds) deltas.set(id, 2);
    }

    const standings: { playerId: string; nickname: string; score: number }[] = [];
    for (const p of players) {
      const delta = deltas.get(p.id) ?? 0;
      const score = (p.score ?? 0) + delta;
      standings.push({ playerId: p.id, nickname: p.nickname, score });
      if (delta !== 0) {
        const { error } = await supabase
          .from("players")
          .update({ score })
          .eq("id", p.id);
        if (error) throw new InternalServerErrorException(error.message);
      }
    }
    standings.sort((a, b) => b.score - a.score);

    const { error: phaseError } = await supabase
      .from("rounds")
      .update({ phase: "result" })
      .eq("id", round.id);
    if (phaseError) throw new InternalServerErrorException(phaseError.message);

    // Reveal the secret footballer's name.
    const { data: footballer } = await supabase
      .from("footballers")
      .select("name")
      .eq("id", round.footballer_id)
      .maybeSingle();

    return {
      roundId: round.id as string,
      phase: "result" as const,
      secret: (footballer?.name as string) ?? null,
      impostorIds,
      ejectedId,
      tie,
      caught,
      outcome,
      votes: (votes ?? []).map((v) => ({
        voterId: v.voter_id as string,
        targetId: v.target_id as string,
      })),
      standings,
    };
  }

  /** Host starts another round once the current one is finished. */
  async nextRound(code: string) {
    const room = await this.roomsService.getRoom(code);
    if (room.status !== "in_game") {
      throw new ConflictException("Game is not in progress");
    }
    const round = await this.getCurrentRound(room.id);
    if (!round || round.phase !== "result") {
      throw new ConflictException("Finish the current round first");
    }
    return this.createRoundAndAssign(room);
  }

  /** Host ends the match. Returns the final standings. */
  async endGame(code: string) {
    const room = await this.roomsService.getRoom(code);
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from("rooms")
      .update({ status: "finished" })
      .eq("id", room.id);
    if (error) throw new InternalServerErrorException(error.message);

    const standings = ((room.players ?? []) as RoomPlayer[])
      .map((p) => ({ playerId: p.id, nickname: p.nickname, score: p.score ?? 0 }))
      .sort((a, b) => b.score - a.score);

    return { status: "finished" as const, standings };
  }
}
