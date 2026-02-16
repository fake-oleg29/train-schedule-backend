import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log(user);

    if (!user) {
      throw new UnauthorizedException('You are not authenticated');
    }

    if (user?.role !== Role.ADMIN) {
      throw new ForbiddenException('You are not an admin');
    }
    return true;
  }
}
