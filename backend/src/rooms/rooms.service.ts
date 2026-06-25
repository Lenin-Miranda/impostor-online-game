import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateRoomDto } from "./dto/create-room.dto";

// Alphabet without confusing characters (no O/0, I/1) for room codes.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

@Injectable()
export class RoomsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /** Generates 5 random characters from the safe alphabet. */
  private generateCode(): string {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return code;
  }

  /** Returns a code that does not exist yet in the DB (retries on collision). */
  private async generateUniqueCode(): Promise<string> {
    const supabase = this.supabaseService.getClient();

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateCode();
      const { data, error } = await supabase
        .from("rooms")
        .select("id")
        .eq("code", code)
        .maybeSingle(); // null if it does not exist (does not throw)

      if (error) throw new InternalServerErrorException(error.message);
      if (!data) return code; // free
    }

    throw new InternalServerErrorException(
      "Could not generate a unique room code.",
    );
  }

  async createRoom(dto: CreateRoomDto) {
    const supabase = this.supabaseService.getClient();

    // 1. Unique code
    const code = await this.generateUniqueCode();

    // 2. Create the room (status and settings use their DB DEFAULTs)
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({ code })
      .select()
      .single();
    if (roomError) throw new InternalServerErrorException(roomError.message);

    // 3. Create the host as a player of that room
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({ room_id: room.id, nickname: dto.nickname, is_host: true })
      .select()
      .single();
    if (playerError) {
      throw new InternalServerErrorException(playerError.message);
    }

    // 4. Mark the host on the room (closes the circular FK)
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ host_player_id: player.id })
      .eq("id", room.id);
    if (updateError)
      throw new InternalServerErrorException(updateError.message);

    // 5. Return the room (with the host already set) and the player
    return { room: { ...room, host_player_id: player.id }, player };
  }

  async joinRoom(code: string, nickname: string) {
    // 1. Search the room by code
    const supabase = this.supabaseService.getClient();
    const normalized = code.toUpperCase();

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", normalized)
      .maybeSingle();

    if (roomError) {
      throw new InternalServerErrorException(roomError.message);
    }

    if (!room) throw new NotFoundException(`Room ${normalized} not found`);

    // 2. The room must still be in the lobby (can't join a game in progress)
    if (room.status !== "lobby") {
      throw new ConflictException(`Room ${normalized} is already in game`);
    }

    // 3. Capacity check: count players and compare with the room's configured limit.
    //    head: true returns only the count, without the rows.
    const { count, error: countError } = await supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);
    if (countError) throw new InternalServerErrorException(countError.message);

    if ((count ?? 0) >= room.settings.maxPlayers) {
      throw new ConflictException(`Room ${normalized} is already full`);
    }

    // 4. Insert the player with is_host: false
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({ room_id: room.id, is_host: false, nickname: nickname })
      .select()
      .single();
    if (playerError) {
      throw new InternalServerErrorException(playerError.message);
    }
    // 5. return room and player
    return { room, player };
  }

  async getRoom(code: string) {
    const supabase = this.supabaseService.getClient();
    const normalized = code.toUpperCase();

    const { data: room, error } = await supabase
      .from("rooms")
      .select("*, players!players_room_id_fkey(*)")
      .eq("code", normalized)
      .maybeSingle();

    if (error) throw new InternalServerErrorException(error.message);
    if (!room)
      throw new NotFoundException(
        `This room does not exist, try a different code`,
      );

    return room;
  }

  /** Host updates the room settings (merges only known keys) and returns the room. */
  async updateSettings(code: string, patch: Record<string, unknown>) {
    const room = await this.getRoom(code);
    const allowed = ["impostors", "category", "time", "hints", "maxPlayers"];
    const merged: Record<string, unknown> = { ...room.settings };
    for (const key of allowed) {
      if (key in patch) merged[key] = patch[key];
    }

    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from("rooms")
      .update({ settings: merged })
      .eq("id", room.id);
    if (error) throw new InternalServerErrorException(error.message);

    return this.getRoom(code);
  }
}
