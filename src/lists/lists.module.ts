import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListItemModule } from '@/list-item/list-item.module';
import { List } from '@/lists/entities/list.entity';
import { ListsResolver } from '@/lists/lists.resolver';
import { ListsService } from '@/lists/lists.service';

@Module({
  providers: [ListsResolver, ListsService],
  imports: [TypeOrmModule.forFeature([List]), ListItemModule],
  exports: [ListsService, TypeOrmModule],
})
export class ListsModule {}
