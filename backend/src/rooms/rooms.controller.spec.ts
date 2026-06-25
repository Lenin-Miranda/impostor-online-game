import { Test } from "@nestjs/testing";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";

describe("RoomsController", () => {
  let controller: RoomsController;
  const service = {
    createRoom: jest.fn().mockResolvedValue({ room: {}, player: {} }),
    joinRoom: jest.fn().mockResolvedValue({ room: {}, player: {} }),
    getRoom: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [{ provide: RoomsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(RoomsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("delegates create() to the service with the DTO", () => {
    const dto = { nickname: "Lenin" };
    controller.create(dto);
    expect(service.createRoom).toHaveBeenCalledWith(dto);
  });

  it("delegates join() with the code and nickname", () => {
    controller.join("ABC12", { nickname: "Marcos" });
    expect(service.joinRoom).toHaveBeenCalledWith("ABC12", "Marcos");
  });
});
