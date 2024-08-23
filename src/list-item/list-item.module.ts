import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListItem } from '@/list-item/entities/list-item.entity';
import { ListItemResolver } from './list-item.resolver';
import { ListItemService } from './list-item.service';
import { List } from '@/lists/entities/list.entity';
import { Item } from '@/items/entities/item.entity';

@Module({
  providers: [ListItemResolver, ListItemService],
  imports: [TypeOrmModule.forFeature([ListItem, List, Item])],
  exports: [ListItemService, TypeOrmModule],
})
export class ListItemModule {}
