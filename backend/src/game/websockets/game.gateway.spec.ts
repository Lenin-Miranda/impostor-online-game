import { Test } from "@nestjs/testing";
import { WsException } from "@nestjs/websockets";
import { GameGateway } from "./game.gateway";
import { RoomsService } from "../../rooms/rooms.service";
import { GameService } from "../game.service";

describe("GameGateway", () => {
  let gateway: GameGateway;
  let emitted: { channel: string; event: string; payload: any }[];

  const rooms = { getRoom: jest.fn() };
  const game = { startGame: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    emitted = [];

    rooms.getRoom.mockResolvedValue({ id: "room-1", host_player_id: "p1" });
    game.startGame.mockResolvedValue({
      roundId: "r1",
      number: 1,
      secret: "Messi",
      roles: [
        { player_id: "p1", role: "crew", hint: null },
        { player_id: "p2", role: "crew", hint: null },
        { player_id: "p3", role: "impostor", hint: "zurdo" },
      ],
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GameGateway,
        { provide: RoomsService, useValue: rooms },
        { provide: GameService, useValue: game },
      ],
    }).compile();
    gateway = moduleRef.get(GameGateway);

    // El @WebSocketServer lo asigna Nest en runtime; aquí lo inyectamos a mano
    // y capturamos a qué canal se emite cada evento.
    (gateway as any).server = {
      to: (channel: string) => ({
        emit: (event: string, payload: any) =>
          emitted.push({ channel, event, payload }),
      }),
    };
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });

  it("sends each player only their own role and broadcasts gameStarted", async () => {
    const client: any = { data: { playerId: "p1" } };
    await gateway.startGame({ code: "abc12" }, client);

    const yourRole = emitted.filter((e) => e.event === "yourRole");
    expect(yourRole).toHaveLength(3);

    // El crew recibe el futbolista; el impostor, solo su pista.
    expect(emitted.find((e) => e.channel === "player:p1")?.payload).toEqual({
      role: "crew",
      footballer: "Messi",
    });
    expect(emitted.find((e) => e.channel === "player:p3")?.payload).toEqual({
      role: "impostor",
      hint: "zurdo",
    });

    // El público va al canal de la sala (code normalizado a mayúsculas) sin secretos.
    const started = emitted.find((e) => e.event === "gameStarted");
    expect(started?.channel).toBe("ABC12");
    expect(started?.payload).toMatchObject({
      roundId: "r1",
      number: 1,
      phase: "reveal",
    });
  });

  it("rejects when a non-host tries to start", async () => {
    const client: any = { data: { playerId: "intruder" } };
    await expect(
      gateway.startGame({ code: "ABC12" }, client),
    ).rejects.toBeInstanceOf(WsException);
    expect(game.startGame).not.toHaveBeenCalled();
  });
});
