import { IsNotEmpty, IsString, IsUUID, IsInt, Min } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  routeId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  fromStopId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  toStopId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  seatNumber: number;
}
