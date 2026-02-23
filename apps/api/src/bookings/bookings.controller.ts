/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Body()
    data: {
      itemId: string;
      borrowerId: string;
      startDate: Date;
      endDate: Date;
    },
  ): Promise<unknown> {
    return this.bookingsService.create(data);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string): Promise<unknown> {
    return this.bookingsService.completeBooking(id);
  }

  @Get('item/:itemId')
  async findByItem(@Param('itemId') itemId: string): Promise<unknown> {
    return this.bookingsService.findByItem(itemId);
  }

  @Get('owner/:ownerId')
  async findByOwner(@Param('ownerId') ownerId: string): Promise<unknown> {
    return this.bookingsService.findByOwner(ownerId);
  }
}
