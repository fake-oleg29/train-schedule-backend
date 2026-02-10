import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TrainsService {
  constructor(private prisma: PrismaService) {}

  async create(createTrainDto: CreateTrainDto) {
    try {
      return await this.prisma.train.create({
        data: createTrainDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Train with number "${createTrainDto.trainNumber}" already exists`,
        );
      }

      throw new InternalServerErrorException('Failed to create train');
    }
  }

  findAll() {
    return this.prisma.train.findMany();
  }

  async findOne(id: string) {
    const train = await this.prisma.train.findUnique({
      where: { id },
    });
    if (!train) {
      throw new NotFoundException('Train not found');
    }
    return train;
  }

  async update(id: string, updateTrainDto: UpdateTrainDto) {
    try {
      return await this.prisma.train.update({
        where: { id },
        data: updateTrainDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const trainNumber = updateTrainDto.trainNumber || 'unknown number';
        throw new ConflictException(
          `Train with number "${trainNumber}" already exists`,
        );
      }

      throw new InternalServerErrorException('Failed to update train');
    }
  }

  remove(id: string) {
    return this.prisma.train.delete({
      where: { id },
    });
  }
}
