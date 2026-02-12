import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { StopsModule } from '../stops/stops.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StopsModule, AuthModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
