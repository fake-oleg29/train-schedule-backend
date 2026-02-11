import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { StopsModule } from 'src/stops/stops.module';

@Module({
  imports: [StopsModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
