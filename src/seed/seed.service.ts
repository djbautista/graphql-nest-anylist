import { Item } from '@/items/entities/item.entity';
import { ItemsService } from '@/items/items.service';
import { ListItem } from '@/list-item/entities/list-item.entity';
import { ListItemService } from '@/list-item/list-item.service';
import { List } from '@/lists/entities/list.entity';
import { ListsService } from '@/lists/lists.service';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from '@/seed/seed.data';
import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService,
    private readonly usersService: UsersService,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.isProd = this.configService.get('STATE') === 'prod';
  }

  async seed() {
    if (this.isProd) throw new Error('Cannot seed in production!');

    await this.deleteAll();
    const users = await this.seedUsers();
    await this.seedLists(users);
    await this.seedItems(users);
    await this.seedListItems(users[0]);

    return 'Seeded!';
  }

  private async deleteAll() {
    await this.listItemRepository.delete({});
    await this.itemRepository.delete({});
    await this.listRepository.delete({});
    await this.userRepository.delete({});
  }

  private async seedUsers() {
    const users = SEED_USERS.map(async (user) => {
      return await this.usersService.create(user);
    });

    return await Promise.all(users);
  }

  private async seedLists(users: User[]) {
    for (const list of SEED_LISTS) {
      await this.listsService.create(list, this.getRandomUser(users));
    }
  }

  private async seedItems(users: User[]) {
    const getRandomPossitiveIntQuantity = () => {
      return Math.floor(Math.random() * 100) + 1;
    };
    for (const item of SEED_ITEMS) {
      await this.itemsService.create(
        { ...item, quantity: getRandomPossitiveIntQuantity() },
        this.getRandomUser(users),
      );
    }
  }

  private async seedListItems(user: User) {
    const lists = await this.listsService.findAll(user);
    const items = await this.itemsService.findAll(user);

    for (const { id: itemId } of items) {
      const { id: listId } = this.getRandomList(lists);
      await this.listItemService.create(
        {
          completed: false,
          itemId,
          listId,
        },
        user,
      );
    }
  }

  private getRandomUser = (users: User[]) => {
    return users[Math.floor(Math.random() * users.length)];
  };

  private getRandomList = (lists: List[]) => {
    return lists[Math.floor(Math.random() * lists.length)];
  };
}
