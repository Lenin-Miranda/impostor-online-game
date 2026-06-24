import { IsString, Length } from "class-validator";

export class JoinRoomDto {
  @IsString()
  @Length(2, 20)
  nickname!: string;
}
