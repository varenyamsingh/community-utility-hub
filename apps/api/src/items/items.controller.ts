import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('nearby')
  async getNearby(@Query('lat') lat: string, @Query('lng') lng: string) {
    // Convert strings from URL to numbers
    return this.itemsService.findNearby(parseFloat(lat), parseFloat(lng));
  }

  @Post()
  async createItem(
    @Body()
    body: {
      title: string;
      description?: string;
      price: number;
      lat: number;
      lng: number;
      ownerId: string;
    },
  ) {
    return this.itemsService.create(body);
  }
}
