import { Module } from '@nestjs/common';
import { StopsService } from './stops.service';
import { StopsController } from './stops.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StopsController],
  providers: [StopsService],
  exports: [StopsService],
})
export class StopsModule {}
