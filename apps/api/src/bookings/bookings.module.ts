import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [BookingsService, PrismaService],
  exports: [BookingsService],
})
export class BookingsModule {}
