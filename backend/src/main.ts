import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS para que el frontend de Next.js pueda llamar a la API
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });

  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? 3001;
  await app.listen(port, "0.0.0.0");
  Logger.log(`Server Listening on Port ${3001}/api`);
}
bootstrap();
