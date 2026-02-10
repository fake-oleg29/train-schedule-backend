import { IsNotEmpty, IsString, IsInt, MinLength, Min } from 'class-validator';

export class CreateTrainDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  trainNumber: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  totalSeats: number;
}
