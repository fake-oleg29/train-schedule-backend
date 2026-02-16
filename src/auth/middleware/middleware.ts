import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const publicRoutes = ['/api/auth/login', '/api/auth/register'];
    const currentPath = req.originalUrl || req.path || req.baseUrl;
    const isPublicRoute = publicRoutes.some((route) =>
      currentPath.startsWith(route),
    );

    if (isPublicRoute) {
      return next();
    }

    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token is missing');
      }
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET!,
      });
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }
      const userId = (decoded as { sub: string }).sub;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req['user'] = user;
      next();
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
