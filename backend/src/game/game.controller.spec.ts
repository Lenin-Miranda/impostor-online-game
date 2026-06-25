import { Test } from "@nestjs/testing";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";

describe("GameController", () => {
  let controller: GameController;
  const service = { startGame: jest.fn().mockResolvedValue({}) };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GameController],
      providers: [{ provide: GameService, useValue: service }],
    }).compile();
    controller = moduleRef.get(GameController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("delegates start() to the service with the code", () => {
    controller.start("ABC12");
    expect(service.startGame).toHaveBeenCalledWith("ABC12");
  });
});
