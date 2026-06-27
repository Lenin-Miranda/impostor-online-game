import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { RoomsService } from "../../rooms/rooms.service";
import { GameService } from "../game.service";

type HintI18n = { es: string; en: string };

type RoundResult = {
  roundId: string;
  number: number;
  secret: string;
  roles: { player_id: string; role: string; hint: HintI18n | null }[];
};

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? "http://localhost:3000" },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly roomsService: RoomsService,
    private readonly gameService: GameService,
  ) {}

  // ── Ciclo de vida ───────────────────────────────────────────

  handleConnection(client: Socket) {
    this.logger.log(`socket conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const { code, playerId } = client.data as {
      code?: string;
      playerId?: string;
    };
    this.logger.log(`socket desconectado: ${client.id}`);
    if (code && playerId) {
      this.server.to(code).emit("presence", { playerId, status: "offline" });
    }
  }

  // ── Helpers ─────────────────────────────────────────────────

  private async assertHost(code: string, client: Socket) {
    const room = await this.roomsService.getRoom(code);
    if (room.host_player_id !== client.data.playerId) {
      throw new WsException("Only the host can do that");
    }
  }

  private fanOutRoles(code: string, result: RoundResult) {
    for (const r of result.roles) {
      const payload =
        r.role === "crew"
          ? { role: "crew", footballer: result.secret }
          : { role: "impostor", hint: r.hint };
      this.server.to(`player:${r.player_id}`).emit("yourRole", payload);
    }
    this.server.to(code).emit("gameStarted", {
      roundId: result.roundId,
      number: result.number,
      phase: "reveal",
    });
  }

  // ── Mensajes del cliente ────────────────────────────────────

  @SubscribeMessage("joinRoom")
  async joinRoom(
    @MessageBody() body: { code: string; playerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();
    await client.join(code);
    await client.join(`player:${body.playerId}`);
    client.data.code = code;
    client.data.playerId = body.playerId;

    const room = await this.roomsService.getRoom(code);
    this.server.to(code).emit("roomUpdated", room);

    // Reconexión: si la partida ya empezó, restauramos el estado de ESTE
    // jugador en privado (su rol, la fase y el resultado si aplica).
    if (room.status !== "lobby") {
      const snapshot = await this.gameService.getGameSnapshot(code, body.playerId);
      client.emit("gameState", snapshot);
    }

    return { ok: true };
  }

  @SubscribeMessage("updateSettings")
  async updateSettings(
    @MessageBody() body: { code: string; settings: Record<string, unknown> },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();
    await this.assertHost(code, client);
    const room = await this.roomsService.updateSettings(code, body.settings);
    this.server.to(code).emit("roomUpdated", room);
    return { ok: true };
  }

  @SubscribeMessage("startGame")
  async startGame(
    @MessageBody() body: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();
    await this.assertHost(code, client);
    const result = await this.gameService.startGame(code);
    this.fanOutRoles(code, result);
    return { ok: true };
  }

  @SubscribeMessage("goToVoting")
  async goToVoting(
    @MessageBody() body: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();
    await this.assertHost(code, client);
    const result = await this.gameService.advanceToVoting(code);
    this.server.to(code).emit("phaseChanged", result);
    return { ok: true };
  }

  @SubscribeMessage("castVote")
  async castVote(
    @MessageBody() body: { code: string; targetId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();
    const voterId = client.data.playerId as string;
    const outcome = await this.gameService.castVote(code, voterId, body.targetId);

    if (outcome.complete) {
      this.server.to(code).emit("roundResult", outcome.result);
    } else {
      this.server.to(code).emit("voteProgress", {
        voted: outcome.voted,
        total: outcome.total,
      });
    }
    return { ok: true };
  }

  @SubscribeMessage("nextRound")
  async nextRound(
    @MessageBody() body: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();
    await this.assertHost(code, client);
    const result = await this.gameService.nextRound(code);
    this.fanOutRoles(code, result);
    return { ok: true };
  }

  @SubscribeMessage("endGame")
  async endGame(
    @MessageBody() body: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();
    await this.assertHost(code, client);
    const result = await this.gameService.endGame(code);
    this.server.to(code).emit("gameEnded", result);
    return { ok: true };
  }
}
