/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    itemId: string;
    borrowerId: string;
    startDate: Date;
    endDate: Date;
  }) {
    // Check for overlapping "confirmed" or "active" bookings
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        itemId: data.itemId,
        status: { in: ['confirmed', 'active', 'pending'] },
        OR: [
          {
            // New booking starts during an old one
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new Error('This tool is already booked for these dates!');
    }

    // If no overlap, create the pending booking
    return this.prisma.booking.create({
      data: {
        itemId: data.itemId,
        borrowerId: data.borrowerId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'pending',
      },
    });
  }

  async completeBooking(bookingId: string) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'completed' },
    });
  }

  async findByItem(itemId: string) {
    return this.prisma.booking.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOwner(ownerId: string) {
    // Get all items owned by this user, then get their bookings
    const items = await this.prisma.item.findMany({
      where: { ownerId },
      select: { id: true },
    });

    const itemIds = items.map((item) => item.id);

    return this.prisma.booking.findMany({
      where: { item: { id: { in: itemIds } } },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
