import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [ItemsModule, BookingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
