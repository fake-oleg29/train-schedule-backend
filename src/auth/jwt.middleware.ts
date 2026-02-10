import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
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
      req['user'] = decoded;
      next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('An unknown error occurred');
    }
  }
}
