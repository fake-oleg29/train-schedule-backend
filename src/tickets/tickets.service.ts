import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, userId: string) {
    try {
      const fromStop = await this.prisma.stop.findUnique({
        where: { id: createTicketDto.fromStopId },
      });

      const toStop = await this.prisma.stop.findUnique({
        where: { id: createTicketDto.toStopId },
      });

      if (!fromStop || !toStop) {
        throw new NotFoundException('One or both stops not found');
      }

      if (fromStop.routeId !== toStop.routeId) {
        throw new ConflictException('Stops must belong to the same route');
      }

      if (fromStop.routeId !== createTicketDto.routeId) {
        throw new ConflictException('Route ID does not match stops route');
      }

      const existingTicket = await this.prisma.ticket.findFirst({
        where: {
          routeId: createTicketDto.routeId,
          userId: userId,
        },
      });

      if (existingTicket) {
        throw new ConflictException({
          message: 'You already have a ticket for this route',
          routeId: createTicketDto.routeId,
        });
      }

      const fromPrice = Number(fromStop.priceFromStart);
      const toPrice = Number(toStop.priceFromStart);
      const price = Math.abs(toPrice - fromPrice);

      const occupiedSeat = await this.prisma.ticket.findFirst({
        where: {
          routeId: createTicketDto.routeId,
          seatNumber: createTicketDto.seatNumber,
        },
      });

      if (occupiedSeat) {
        throw new ConflictException({
          message: `Seat ${createTicketDto.seatNumber} is already taken`,
          routeId: createTicketDto.routeId,
        });
      }

      return await this.prisma.ticket.create({
        data: {
          routeId: createTicketDto.routeId,
          userId,
          fromStopId: createTicketDto.fromStopId,
          toStopId: createTicketDto.toStopId,
          price,
          seatNumber: createTicketDto.seatNumber,
        },
        include: {
          route: {
            include: {
              train: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fromStop: true,
          toStop: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create ticket');
    }
  }

  findByUserId(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        route: {
          include: {
            train: true,
            stops: {
              orderBy: {
                stopNumber: 'asc',
              },
            },
          },
        },
        fromStop: true,
        toStop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string, userId: string) {
    try {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }

      if (ticket.userId !== userId) {
        throw new ConflictException('You can only cancel your own tickets');
      }

      return await this.prisma.ticket.delete({
        where: { id },
        include: {
          route: {
            include: {
              train: true,
            },
          },
          fromStop: true,
          toStop: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Ticket not found');
      }

      throw new InternalServerErrorException('Failed to cancel ticket');
    }
  }
}
