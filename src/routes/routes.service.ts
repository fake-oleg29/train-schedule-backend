import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  create(createRouteDto: CreateRouteDto) {
    return this.prisma.route.create({
      data: createRouteDto,
      include: {
        train: true,
        stops: {
          orderBy: {
            stopNumber: 'asc',
          },
        },
      },
    });
  }

  findAll(fromStation?: string, toStation?: string) {
    if (fromStation && toStation) {
      return this.prisma.route.findMany({
        where: {
          AND: [
            {
              stops: {
                some: {
                  stationName: {
                    contains: fromStation,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              stops: {
                some: {
                  stationName: {
                    contains: toStation,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        },
        include: {
          train: true,
          stops: {
            orderBy: {
              stopNumber: 'asc',
            },
          },
        },
      });
    }
    if (fromStation || toStation) {
      const stationName = fromStation || toStation;
      return this.prisma.route.findMany({
        where: {
          stops: {
            some: {
              stationName: {
                contains: stationName,
                mode: 'insensitive',
              },
            },
          },
        },
        include: {
          train: true,
          stops: {
            orderBy: {
              stopNumber: 'asc',
            },
          },
        },
      });
    }
    return this.prisma.route.findMany({
      include: {
        train: true,
        stops: {
          orderBy: {
            stopNumber: 'asc',
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.route.findUnique({
      where: { id },
      include: {
        train: true,
        stops: {
          orderBy: {
            stopNumber: 'asc',
          },
        },
      },
    });
  }

  update(id: string, updateRouteDto: UpdateRouteDto) {
    return this.prisma.route.update({
      where: { id },
      data: updateRouteDto,
      include: {
        train: true,
        stops: {
          orderBy: {
            stopNumber: 'asc',
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.route.delete({
      where: { id },
      include: {
        train: true,
        stops: true,
      },
    });
  }
}
