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

    const { data: pool, error: poolError } = await supabase
      .from("footballers")
      .select("id, name, league, hint, hint_en");
    if (poolError) throw new InternalServerErrorException(poolError.message);
    if (!pool || pool.length === 0) {
      throw new InternalServerErrorException("Footballers catalog is empty");
    }
    const secret = pool[Math.floor(Math.random() * pool.length)];

    const { count, error: countError } = await supabase
      .from("rounds")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);
    if (countError) throw new InternalServerErrorException(countError.message);
    const number = (count ?? 0) + 1;

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

    const shuffled = this.shuffle(players);
    const roles = shuffled.map((player, i) => {
      const isImpostor = i < impostors;
      return {
        player_id: player.id,
        role: isImpostor ? "impostor" : "crew",
        // Bilingual hint { es, en } for the impostor; the client renders it
        // in the player's language. en falls back to es when not translated.
        hint:
          isImpostor && room.settings.hints
            ? { es: secret.hint, en: secret.hint_en ?? secret.hint }
            : null,
      };
    });

    const { error: assignError } = await supabase.from("assignments").insert(
      roles.map((r) => ({
        round_id: round.id,
        player_id: r.player_id,
        role: r.role,
      })),
    );
    if (assignError) throw new InternalServerErrorException(assignError.message);

    return {
      roundId: round.id,
      number,
      secret: secret.name as string,
      roles,
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
   * A player votes for a suspect. The vote count is registered atomically
   * (DB function with a per-round lock), so concurrent votes never miss the
   * "everyone voted" trigger. When complete, the round result is computed.
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
    const { data: voted, error } = await supabase.rpc("register_vote", {
      p_round_id: round.id,
      p_voter_id: voterId,
      p_target_id: targetId,
    });
    if (error) throw new InternalServerErrorException(error.message);

    const total = players.length;
    if ((voted ?? 0) >= total) {
      const result = await this.computeResult(round, players);
      // result is null if another concurrent vote already computed it.
      if (result) return { complete: true as const, result };
    }
    return { complete: false as const, voted: (voted ?? 0) as number, total };
  }

  /**
   * Tally votes, decide the outcome, update scores and reveal everything.
   * Idempotent: the first caller atomically claims the round (voting ->
   * result); any concurrent caller gets null and does NOT re-score.
   */
  private async computeResult(round: any, players: RoomPlayer[]) {
    const supabase = this.supabaseService.getClient();

    // Atomic claim: only the row still in 'voting' is flipped to 'result'.
    const { data: claimed, error: claimError } = await supabase
      .from("rounds")
      .update({ phase: "result" })
      .eq("id", round.id)
      .eq("phase", "voting")
      .select("id")
      .maybeSingle();
    if (claimError) throw new InternalServerErrorException(claimError.message);
    if (!claimed) return null; // someone else already computed this round

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

    const tally = new Map<string, number>();
    for (const v of votes ?? []) {
      tally.set(v.target_id, (tally.get(v.target_id) ?? 0) + 1);
    }

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

    const { data: footballer } = await supabase
      .from("footballers")
      .select("name")
      .eq("id", round.footballer_id)
      .maybeSingle();

    const payload = {
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

    // Persist the result so reconnecting players can be re-shown it.
    const { error: storeError } = await supabase
      .from("rounds")
      .update({ result: payload })
      .eq("id", round.id);
    if (storeError) throw new InternalServerErrorException(storeError.message);

    return payload;
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

  /**
   * Snapshot of the game for a player who (re)connects: their private role,
   * the current phase and the result if the round is already resolved.
   * Lets the frontend restore the right screen after a reload.
   */
  async getGameSnapshot(code: string, playerId: string) {
    const room = await this.roomsService.getRoom(code);

    if (room.status === "lobby") {
      return { status: "lobby" as const };
    }

    if (room.status === "finished") {
      const standings = ((room.players ?? []) as RoomPlayer[])
        .map((p) => ({ playerId: p.id, nickname: p.nickname, score: p.score ?? 0 }))
        .sort((a, b) => b.score - a.score);
      return { status: "finished" as const, standings };
    }

    // in_game
    const round = await this.getCurrentRound(room.id);
    if (!round) return { status: "in_game" as const };

    const supabase = this.supabaseService.getClient();
    const { data: assignment } = await supabase
      .from("assignments")
      .select("role")
      .eq("round_id", round.id)
      .eq("player_id", playerId)
      .maybeSingle();

    let role: unknown = null;
    if (assignment) {
      const { data: footballer } = await supabase
        .from("footballers")
        .select("name, hint, hint_en")
        .eq("id", round.footballer_id)
        .maybeSingle();
      if (assignment.role === "crew") {
        role = { role: "crew", footballer: footballer?.name ?? null };
      } else if (room.settings.hints && footballer) {
        role = {
          role: "impostor",
          hint: { es: footballer.hint, en: footballer.hint_en ?? footballer.hint },
        };
      } else {
        role = { role: "impostor", hint: null };
      }
    }

    return {
      status: "in_game" as const,
      phase: round.phase as string,
      role,
      result: round.phase === "result" ? round.result : null,
    };
  }
}
