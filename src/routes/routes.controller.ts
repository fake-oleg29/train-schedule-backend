import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { AdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('routes')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  findAll(
    @Query('from') fromStation?: string,
    @Query('to') toStation?: string,
    @Query('date') date?: string,
  ) {
    const dateObj = date ? new Date(date) : undefined;
    return this.routesService.findAll(fromStation, toStation, dateObj);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }
}
