import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Request() req: any) {
    const userId = (req.user?.sub || req.user?.id) as string;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ticketsService.create(createTicketDto, userId);
  }

  @Get('my')
  findMyTickets(@Request() req: any) {
    const userId = (req.user?.sub || req.user?.id) as string;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ticketsService.findByUserId(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = (req.user?.sub || req.user?.id) as string;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ticketsService.remove(id, userId);
  }
}
