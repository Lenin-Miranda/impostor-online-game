import { Body, Controller, Param, Post, Get } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { JoinRoomDto } from "./dto/join-room.dto";

@Controller("rooms")
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Post(":code/join")
  join(@Param("code") code: string, @Body() dto: JoinRoomDto) {
    return this.roomsService.joinRoom(code, dto.nickname);
  }

  @Get(":code")
  get(@Param("code") code: string) {
    return this.roomsService.getRoom(code);
  }
}
