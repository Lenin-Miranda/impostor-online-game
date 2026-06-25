import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameController } from "./game.controller";
import { GameGateway } from "./websockets/game.gateway";
import { RoomsModule } from "src/rooms/rooms.module";

@Module({
  imports: [RoomsModule],
  providers: [GameService, GameGateway],
  controllers: [GameController],
})
export class GameModule {}
