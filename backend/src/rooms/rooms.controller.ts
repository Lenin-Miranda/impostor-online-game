import { Body, Controller, Post } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";

@Controller("rooms")
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }
}
