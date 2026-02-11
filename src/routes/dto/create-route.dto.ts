import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreateStopDto } from 'src/stops/dto/create-stop.dto';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  trainId: string;

  @IsDate()
  @IsNotEmpty()
  departureDateTime: Date;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  stops: CreateStopDto[];
}
