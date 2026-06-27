import { Test } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { GameService } from "./game.service";
import { RoomsService } from "src/rooms/rooms.service";
import { SupabaseService } from "src/supabase/supabase.service";

/**
 * Mock encadenable del cliente de Supabase: cada builder es "awaitable"
 * (tiene `then`) y resuelve según la tabla + operación usada.
 */
function makeSupabaseClient(footballers: any[]) {
  const resolveFor = (b: any) => {
    if (b._table === "footballers") return { data: footballers, error: null };
    if (b._table === "rounds" && b._op === "insert") {
      return { data: { id: "round-1" }, error: null };
    }
    if (b._table === "rounds") return { count: 0, error: null };
    return { error: null };
  };

  const from = (table: string) => {
    const b: any = { _table: table, _op: null };
    b.select = () => {
      if (!b._op) b._op = "select";
      return b;
    };
    b.insert = () => ((b._op = "insert"), b);
    b.update = () => ((b._op = "update"), b);
    b.eq = () => b;
    b.single = () => b;
    b.then = (res: any, rej: any) => Promise.resolve(resolveFor(b)).then(res, rej);
    return b;
  };

  return { from };
}

const baseRoom = {
  id: "room-1",
  status: "lobby",
  host_player_id: "p1",
  settings: { impostors: 1, category: "Stars", hints: true, maxPlayers: 10 },
  players: [{ id: "p1" }, { id: "p2" }, { id: "p3" }],
};

const oneFootballer = [
  {
    id: "f1",
    name: "Messi",
    league: "Legends",
    hint: "zurdo, baja estatura",
    hint_en: "left-footed, short",
  },
];

describe("GameService", () => {
  let service: GameService;

  async function build(room: any, footballers = oneFootballer) {
    const rooms = { getRoom: jest.fn().mockResolvedValue(room) };
    const supabase = { getClient: () => makeSupabaseClient(footballers) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: RoomsService, useValue: rooms },
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile();
    service = moduleRef.get(GameService);
  }

  it("should be defined", async () => {
    await build(baseRoom);
    expect(service).toBeDefined();
  });

  it("rejects if the game already started", async () => {
    await build({ ...baseRoom, status: "in_game" });
    await expect(service.startGame("ABC12")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("rejects with fewer than 3 players", async () => {
    await build({ ...baseRoom, players: [{ id: "p1" }, { id: "p2" }] });
    await expect(service.startGame("ABC12")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("rejects if there are as many impostors as players", async () => {
    await build({
      ...baseRoom,
      settings: { ...baseRoom.settings, impostors: 3 },
    });
    await expect(service.startGame("ABC12")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("assigns exactly one impostor and reveals the footballer to the crew", async () => {
    await build(baseRoom);
    const result = await service.startGame("ABC12");

    expect(result.secret).toBe("Messi");
    expect(result.number).toBe(1);
    expect(result.roles).toHaveLength(3);

    const impostors = result.roles.filter((r) => r.role === "impostor");
    const crew = result.roles.filter((r) => r.role === "crew");
    expect(impostors).toHaveLength(1);
    expect(crew).toHaveLength(2);

    // Solo el impostor recibe la pista (bilingüe); el crew, nada.
    expect(impostors[0].hint).toEqual({
      es: "zurdo, baja estatura",
      en: "left-footed, short",
    });
    expect(crew.every((c) => c.hint === null)).toBe(true);
  });

  it("does not hand a hint to the impostor when the room has hints off", async () => {
    await build({
      ...baseRoom,
      settings: { ...baseRoom.settings, hints: false },
    });
    const result = await service.startGame("ABC12");
    const impostor = result.roles.find((r) => r.role === "impostor");
    expect(impostor?.hint).toBeNull();
  });
});
