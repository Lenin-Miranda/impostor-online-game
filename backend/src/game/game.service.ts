import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { RoomsService } from "src/rooms/rooms.service";
import { SupabaseService } from "src/supabase/supabase.service";

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

  async startGame(code: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Room with its players (getRoom already 404s if it does not exist)
    const room = await this.roomsService.getRoom(code);
    const players = (room.players ?? []) as Array<{ id: string }>;
    const impostors = room.settings.impostors;

    // 2. Validations
    if (room.status !== "lobby") {
      throw new ConflictException("Game already started");
    }
    if (players.length < 3) {
      throw new ConflictException("Need at least 3 players to start");
    }
    if (impostors >= players.length) {
      throw new ConflictException("Too many impostors for the number of players");
    }

    // 3. Pick the secret footballer
    const { data: pool, error: poolError } = await supabase
      .from("footballers")
      .select("id, name, league");
    if (poolError) throw new InternalServerErrorException(poolError.message);
    if (!pool || pool.length === 0) {
      throw new InternalServerErrorException("Footballers catalog is empty");
    }
    const secret = pool[Math.floor(Math.random() * pool.length)];

    // 4. Next round number (how many rounds the room already has + 1)
    const { count, error: countError } = await supabase
      .from("rounds")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);
    if (countError) throw new InternalServerErrorException(countError.message);
    const number = (count ?? 0) + 1;

    // 5. Create the round first (assignments reference it via FK)
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

    // 6. Assign roles: shuffle, the first N are impostors
    const shuffled = this.shuffle(players);
    const assignments = shuffled.map((player, i) => ({
      round_id: round.id,
      player_id: player.id,
      role: i < impostors ? "impostor" : "crew",
      // vague hint only for the impostor, and only if the room allows hints
      hint: i < impostors && room.settings.hints ? secret.league : null,
    }));

    // 7. Insert the roles in bulk (pass the whole array)
    const { error: assignError } = await supabase
      .from("assignments")
      .insert(assignments);
    if (assignError) throw new InternalServerErrorException(assignError.message);

    // 8. Mark the room as in game
    const { error: statusError } = await supabase
      .from("rooms")
      .update({ status: "in_game" })
      .eq("id", room.id);
    if (statusError) throw new InternalServerErrorException(statusError.message);

    // 9. Summary — TEST ONLY: it exposes the secret and who is the impostor.
    //    In the WebSocket step each player will receive only THEIR role privately.
    return {
      roundId: round.id,
      number,
      secret: secret.name,
      roles: assignments.map((a) => ({
        player_id: a.player_id,
        role: a.role,
        hint: a.hint,
      })),
    };
  }
}
