import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateStopDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  routeId: string;

  @IsString()
  @IsNotEmpty()
  stationName: string;

  @IsDate()
  @IsNotEmpty()
  arrivalDateTime: Date;

  @IsDate()
  @IsNotEmpty()
  departureDateTime: Date;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  stopNumber: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  priceFromStart: number;
}
