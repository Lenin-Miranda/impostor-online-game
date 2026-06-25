import { Controller, Param, Post } from "@nestjs/common";
import { GameService } from "./game.service";

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post(":code/start")
  start(@Param("code") code: string) {
    return this.gameService.startGame(code);
  }
}
