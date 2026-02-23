import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  // lat: Latitude, lng: Longitude
  async findNearby(lat: number, lng: number, radiusInMeters: number = 2000) {
    try {
      // Try with PostGIS first
      const result = await this.prisma.$queryRaw`
        SELECT id, title, description, price_per_day,
               ST_AsGeoJSON(location)::json as location
        FROM items
        WHERE ST_DWithin(
          location,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusInMeters}
        );
      `;
      return result;
    } catch (error) {
      console.error('PostGIS findNearby error:', error);
      // Fallback: return all items without location filtering
      const items = await this.prisma.item.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          price_per_day: true,
        }
      });
      return items.map(item => ({ ...item, location: null }));
    }
  }

  async create(data: {
    title: string;
    description?: string;
    price: number;
    lat: number;
    lng: number;
    ownerId: string;
  }) {
    try {
      // Try with PostGIS first
      return await this.prisma.$executeRaw`
        INSERT INTO items (title, description, price_per_day, location, owner_id)
        VALUES (
          ${data.title}, 
          ${data.description || ''}, 
          ${data.price}, 
          ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)::geography,
          ${data.ownerId}
        )
      `;
    } catch (error) {
      console.error('PostGIS create error:', error);
      // Fallback: create without location
      return await this.prisma.item.create({
        data: {
          title: data.title,
          description: data.description || '',
          price_per_day: data.price,
          ownerId: data.ownerId,
        }
      });
    }
  }
}
