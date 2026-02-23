/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // In production, verify the JWT with Supabase
    // For now, we'll just check if a token exists and extract user ID

    if (token) {
      // Store user ID in request for use in controllers
      (request as any).userId = token;
      return true;
    }
    throw new UnauthorizedException('Invalid token');
  }
}
