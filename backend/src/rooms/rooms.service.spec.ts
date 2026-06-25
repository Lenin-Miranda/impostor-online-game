import { Test } from "@nestjs/testing";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { SupabaseService } from "../supabase/supabase.service";

/** Mock encadenable: `rooms` resuelve a `room`, `players` al `count`. */
function makeSupabaseClient(room: any, count = 0) {
  const from = (table: string) => {
    const b: any = {};
    b.select = () => b;
    b.insert = () => b;
    b.eq = () => b;
    b.single = () => b;
    b.maybeSingle = () => b;
    b.then = (res: any, rej: any) => {
      if (table === "rooms") {
        return Promise.resolve({ data: room, error: null }).then(res, rej);
      }
      if (table === "players") {
        return Promise.resolve({ count, data: { id: "pl-1" }, error: null }).then(
          res,
          rej,
        );
      }
      return Promise.resolve({ error: null }).then(res, rej);
    };
    return b;
  };
  return { from };
}

const lobbyRoom = {
  id: "room-1",
  status: "lobby",
  settings: { maxPlayers: 10 },
};

describe("RoomsService", () => {
  async function build(room: any, count = 0) {
    const supabase = { getClient: () => makeSupabaseClient(room, count) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile();
    return moduleRef.get(RoomsService);
  }

  it("should be defined", async () => {
    expect(await build(lobbyRoom)).toBeDefined();
  });

  it("joinRoom throws NotFound when the room does not exist", async () => {
    const service = await build(null);
    await expect(service.joinRoom("ZZZZZ", "Ana")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("joinRoom throws Conflict when the game already started", async () => {
    const service = await build({ ...lobbyRoom, status: "in_game" });
    await expect(service.joinRoom("ABC12", "Ana")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("joinRoom throws Conflict when the room is full", async () => {
    const service = await build({ ...lobbyRoom, settings: { maxPlayers: 2 } }, 2);
    await expect(service.joinRoom("ABC12", "Ana")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
