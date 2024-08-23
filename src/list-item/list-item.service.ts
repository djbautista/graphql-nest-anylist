import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationArgs, SearchArgs } from '@/common/dto/args';
import { ItemsService } from '@/items/items.service';
import { CreateListItemInput } from '@/list-item/dto/create-list-item.input';
import { UpdateListItemInput } from '@/list-item/dto/update-list-item.input';
import { ListItem } from '@/list-item/entities/list-item.entity';
import { List } from '@/lists/entities/list.entity';
import { User } from '@/users/entities/user.entity';
import { Item } from '@/items/entities/item.entity';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(createListItemInput: CreateListItemInput, user: User) {
    const { listId, itemId, ...rest } = createListItemInput;

    const list = await this.listRepository.findOne({
      where: {
        id: listId,
        user: {
          id: user.id,
        },
      },
    });

    const item = await this.itemRepository.findOne({
      where: {
        id: itemId,
        user: {
          id: user.id,
        },
      },
    });

    if (!list || !item) {
      throw new NotFoundException('List or item not found');
    }

    const newListItem = this.listItemRepository.create({
      ...rest,
      list: { id: listId },
      item: { id: itemId },
    });

    const { id } = await this.listItemRepository.save(newListItem);

    return this.findOne(id, user);
  }

  findAllByList(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ) {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const query = this.listItemRepository
      .createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .where('listItem.listId = :listId', { listId: list.id })
      .take(limit)
      .skip(offset);

    if (search) {
      query.andWhere('LOWER(item.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    return query.getMany();
  }

  async findOne(id: string, user: User) {
    const listItem = await this.listItemRepository.findOne({
      where: {
        id,
        list: {
          user: {
            id: user.id,
          },
        },
      },
    });

    if (!listItem) {
      throw new NotFoundException('List item not found');
    }

    return listItem;
  }

  countItemsByList(list: List) {
    return this.listItemRepository.count({
      where: {
        list: {
          id: list.id,
        },
      },
    });
  }

  async update(updateListItemInput: UpdateListItemInput, user: User) {
    await this.findOne(updateListItemInput.id, user);

    const { id, listId, itemId, ...rest } = updateListItemInput;

    const query = this.listItemRepository
      .createQueryBuilder()
      .update()
      .set({ id, ...rest })
      .where('id = :id', { id });

    if (listId) query.set({ list: { id: listId } });
    if (itemId) query.set({ item: { id: itemId } });

    await query.execute();

    return this.findOne(id, user);
  }
}
