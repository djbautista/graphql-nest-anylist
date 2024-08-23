import { Item } from '@/items/entities/item.entity';
import { ItemsService } from '@/items/items.service';
import { SEED_ITEMS, SEED_USERS } from '@/seed/seed.data';
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
    private readonly usersService: UsersService,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.isProd = this.configService.get('STATE') === 'prod';
  }

  async seed() {
    if (this.isProd) throw new Error('Cannot seed in production!');

    await this.deleteAll();
    const users = await this.seedUsers();
    await this.seedItems(users);

    return 'Seeded!';
  }

  private async deleteAll() {
    await this.itemRepository.delete({});
    await this.userRepository.delete({});
  }

  private async seedUsers() {
    const users = SEED_USERS.map(async (user) => {
      console.log({ user });
      return await this.usersService.create(user);
    });

    return await Promise.all(users);
  }

  private async seedItems(users: User[]) {
    const getRandomPossitiveIntQuantity = () => {
      return Math.floor(Math.random() * 100) + 1;
    };

    const getRandomUser = () => {
      return users[Math.floor(Math.random() * users.length)];
    };
    for (const item of SEED_ITEMS) {
      await this.itemsService.create(
        { ...item, quantity: getRandomPossitiveIntQuantity() },
        getRandomUser(),
      );
    }
  }
}
