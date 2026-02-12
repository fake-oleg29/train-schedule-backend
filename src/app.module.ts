import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TrainsModule } from './trains/trains.module';
import { JwtMiddleware } from './auth/middleware';
import { JwtModule } from '@nestjs/jwt';
import { RoutesModule } from './routes/routes.module';
import { PrismaModule } from './prisma/prisma.module';
import { StopsModule } from './stops/stops.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TrainsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '1d' },
    }),
    RoutesModule,
    StopsModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('*');
  }
}
