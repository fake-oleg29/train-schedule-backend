import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StopsService } from 'src/stops/stops.service';

@Injectable()
export class RoutesService {
  constructor(
    private prisma: PrismaService,
    private stopsService: StopsService,
  ) {}

  async create(createRouteDto: CreateRouteDto) {
    const { trainId, departureDateTime, stops } = createRouteDto;

    const route = await this.prisma.route.create({
      data: {
        trainId,
        departureDateTime,
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

    if (stops && stops.length > 0) {
      await Promise.all(
        stops.map((stop) =>
          this.stopsService.create({ ...stop, routeId: route.id }),
        ),
      );
    }

    return this.prisma.route.findUnique({
      where: { id: route.id },
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

  async findAll(fromStation?: string, toStation?: string, date?: Date) {
    const conditions: any[] = [];

    if (fromStation && toStation) {
      conditions.push({
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
      });
    } else if (fromStation || toStation) {
      const stationName = fromStation || toStation;
      conditions.push({
        stops: {
          some: {
            stationName: {
              contains: stationName,
              mode: 'insensitive',
            },
          },
        },
      });
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      conditions.push({
        departureDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    const routes = await this.prisma.route.findMany({
      where: conditions.length > 0 ? { AND: conditions } : {},
      include: {
        train: true,
        stops: {
          orderBy: {
            stopNumber: 'asc',
          },
        },
      },
    });

    return routes
      .map((route) => {
        const sortedStops = route.stops.sort(
          (a, b) => Number(a.stopNumber) - Number(b.stopNumber),
        );

        if (!sortedStops || sortedStops.length === 0) {
          return null;
        }

        let filteredStops = sortedStops;
        let startStop = sortedStops[0];
        let endStop = sortedStops[sortedStops.length - 1];

        if (fromStation && toStation) {
          const fromStopIndex = sortedStops.findIndex((stop) =>
            stop.stationName.toLowerCase().includes(fromStation.toLowerCase()),
          );
          const toStopIndex = sortedStops.findIndex((stop) =>
            stop.stationName.toLowerCase().includes(toStation.toLowerCase()),
          );

          if (fromStopIndex === -1 || toStopIndex === -1) {
            return null;
          }

          const fromStopNumber = Number(sortedStops[fromStopIndex].stopNumber);
          const toStopNumber = Number(sortedStops[toStopIndex].stopNumber);
          const lastStopNumber = Number(
            sortedStops[sortedStops.length - 1].stopNumber,
          );

          const isFirstStop = fromStopNumber === 1;
          const isLastStop = toStopNumber === lastStopNumber;

          if (!(isFirstStop && isLastStop)) {
            const minStopNumber = Math.min(fromStopNumber, toStopNumber);
            const maxStopNumber = Math.max(fromStopNumber, toStopNumber);

            filteredStops = sortedStops.filter((stop) => {
              const stopNum = Number(stop.stopNumber);
              return stopNum >= minStopNumber && stopNum <= maxStopNumber;
            });

            if (filteredStops.length > 0) {
              startStop = filteredStops[0];
              endStop = filteredStops[filteredStops.length - 1];
            }
          } else {
            startStop = sortedStops[fromStopIndex];
            endStop = sortedStops[toStopIndex];
          }
        }

        if (!startStop || !endStop) {
          return null;
        }

        const startPrice = Number(startStop.priceFromStart);
        const endPrice = Number(endStop.priceFromStart);
        const ticketPrice = Math.abs(endPrice - startPrice);

        const departureTime = new Date(startStop.departureDateTime as Date);
        const arrivalTime = new Date(endStop.arrivalDateTime as Date);
        const durationMs = arrivalTime.getTime() - departureTime.getTime();

        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        const duration = {
          totalMinutes: Math.floor(durationMs / (1000 * 60)),
          hours,
          minutes,
          formatted: `${hours} hour ${minutes} minutes`,
        };

        return {
          ...route,
          stops: filteredStops,
          ticketPrice,
          startStation: {
            id: startStop.id,
            name: startStop.stationName,
            departureDateTime: startStop.departureDateTime,
          },
          endStation: {
            id: endStop.id,
            name: endStop.stationName,
            arrivalDateTime: endStop.arrivalDateTime,
          },
          duration,
        };
      })
      .filter((route) => route !== null);
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
