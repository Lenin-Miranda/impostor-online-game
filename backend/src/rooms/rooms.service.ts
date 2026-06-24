import { Injectable, InternalServerErrorException } from "@nestjs/common";
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

    throw new InternalServerErrorException("Could not generate a unique room code.");
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
    if (updateError) throw new InternalServerErrorException(updateError.message);

    // 5. Return the room (with the host already set) and the player
    return { room: { ...room, host_player_id: player.id }, player };
  }
}
