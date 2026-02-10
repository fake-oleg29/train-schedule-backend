import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStopDto } from './dto/create-stop.dto';
import { UpdateStopDto } from './dto/update-stop.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class StopsService {
  constructor(private prisma: PrismaService) {}

  async create(createStopDto: CreateStopDto) {
    if (createStopDto.arrivalDateTime > createStopDto.departureDateTime) {
      throw new ConflictException(
        'Arrival time cannot be later than departure time',
      );
    }

    try {
      return await this.prisma.stop.create({
        data: createStopDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Stop with these parameters already exists',
        );
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Route not found');
      }

      throw new InternalServerErrorException('Failed to create stop');
    }
  }

  findAll() {
    return this.prisma.stop.findMany({
      include: {
        route: true,
      },
    });
  }

  async findOne(id: string) {
    const stop = await this.prisma.stop.findUnique({
      where: { id },
      include: {
        route: true,
      },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    return stop;
  }

  async update(id: string, updateStopDto: UpdateStopDto) {
    try {
      return await this.prisma.stop.update({
        where: { id },
        data: updateStopDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Stop with these parameters already exists',
        );
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Stop not found');
      }

      throw new InternalServerErrorException('Failed to update stop');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.stop.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Stop not found');
      }

      throw new InternalServerErrorException('Failed to delete stop');
    }
  }
}
