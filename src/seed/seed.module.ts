import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ItemsModule } from '@/items/items.module';
import { ListItemModule } from '@/list-item/list-item.module';
import { ListsModule } from '@/lists/lists.module';
import { UsersModule } from '@/users/users.module';
import { SeedResolver } from '@/seed/seed.resolver';
import { SeedService } from '@/seed/seed.service';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [
    ConfigModule,
    UsersModule,
    ItemsModule,
    ListsModule,
    ListItemModule,
  ],
})
export class SeedModule {}
