import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameController } from "./game.controller";
import { RoomsModule } from "src/rooms/rooms.module";

@Module({
  imports: [RoomsModule],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
