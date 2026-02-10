import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsDate,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  trainId: string;

  @IsDate()
  @IsNotEmpty()
  departureDateTime: Date;

  @IsNumber()
  @IsNotEmpty()
  basePrice: number;
}
