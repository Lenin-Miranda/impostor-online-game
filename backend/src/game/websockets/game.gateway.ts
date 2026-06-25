import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { RoomsService } from "../../rooms/rooms.service";
import { GameService } from "../game.service";
import { WsException } from "@nestjs/websockets";

// @WebSocketGateway monta un servidor socket.io junto al de HTTP.
// El `cors` deja que el frontend (Next.js en :3000) se conecte.
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? "http://localhost:3000" },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // El servidor de socket.io. Lo usamos para emitir a canales.
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(GameGateway.name);

  // Un gateway es un provider normal: puede inyectar servicios igual
  // que un controller o un service.
  constructor(
    private readonly roomsService: RoomsService,
    private readonly gameService: GameService,
  ) {}

  // ── Ciclo de vida de la conexión ────────────────────────────

  // Se dispara cuando un cliente ABRE la conexión de socket.
  handleConnection(client: Socket) {
    this.logger.log(`socket conectado: ${client.id}`);
  }

  // Se dispara cuando un cliente se DESCONECTA (cierra pestaña, pierde red...).
  handleDisconnect(client: Socket) {
    // Recuperamos lo que guardamos en el socket al unirse (paso 2 de joinRoom).
    const { code, playerId } = client.data as {
      code?: string;
      playerId?: string;
    };
    this.logger.log(`socket desconectado: ${client.id}`);

    // Si ya estaba en una sala, avisamos al resto que este jugador se fue.
    if (code && playerId) {
      this.server.to(code).emit("presence", { playerId, status: "offline" });
    }
  }

  // ── Mensajes que manda el cliente ───────────────────────────

  // El cliente emite "joinRoom" justo después de conectarse, mandando su
  // código de sala y su playerId (el que le devolvió el REST al crear/unirse).
  @SubscribeMessage("joinRoom")
  async joinRoom(
    @MessageBody() body: { code: string; playerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();

    // 1. Unimos este socket a DOS canales (rooms de socket.io):
    //    - `code`        -> canal de la sala, para broadcasts a todos.
    //    - `player:<id>` -> canal personal, para mensajes privados
    //                       (p.ej. mandarle SU rol sin que nadie más lo vea).
    await client.join(code);
    await client.join(`player:${body.playerId}`);

    // 2. Guardamos datos en el propio socket para usarlos luego
    //    (por ejemplo, al desconectar sabemos de qué sala era).
    client.data.code = code;
    client.data.playerId = body.playerId;

    // 3. Leemos el estado actual de la sala y avisamos a TODOS los del canal
    //    para que sus lobbies se refresquen con el nuevo jugador.
    const room = await this.roomsService.getRoom(code);
    this.server.to(code).emit("roomUpdated", room);

    // 4. Devolvemos un "ack" al cliente que emitió "joinRoom"
    //    (socket.io se lo entrega como respuesta a ese evento concreto).
    return { ok: true };
  }
  @SubscribeMessage("startGame")
  async startGame(
    @MessageBody() body: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = body.code.toUpperCase();

    // (recomendado) solo el anfitrión puede iniciar.
    // Usamos el playerId que guardamos en el socket al hacer joinRoom.
    const room = await this.roomsService.getRoom(code);
    if (room.host_player_id !== client.data.playerId) {
      throw new WsException("Only the host can start the game");
    }

    // 1. Ejecuta el reparto (tu lógica del Paso 2).
    const result = await this.gameService.startGame(code);

    // 2. PRIVADO: a cada jugador, solo SU rol, por su canal personal.
    for (const r of result.roles) {
      const payload =
        r.role === "crew"
          ? { role: "crew", footballer: result.secret }
          : { role: "impostor", hint: r.hint };
      this.server.to(`player:${r.player_id}`).emit("yourRole", payload);
    }

    // 3. PÚBLICO: avisa a la sala que empezó (sin secretos).
    this.server.to(code).emit("gameStarted", {
      roundId: result.roundId,
      number: result.number,
      phase: "reveal",
    });

    return { ok: true };
  }
}
