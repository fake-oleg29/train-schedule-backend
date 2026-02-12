import { Module } from '@nestjs/common';
import { TrainsService } from './trains.service';
import { TrainsController } from './trains.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TrainsController],
  providers: [TrainsService],
})
export class TrainsModule {}
