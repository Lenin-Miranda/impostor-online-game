import { Test } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    controller = moduleRef.get(AppController);
  });

  it("returns health with status ok", () => {
    const health = controller.getHealth();
    expect(health.status).toBe("ok");
    expect(health.service).toBe("impostor-backend");
  });
});
