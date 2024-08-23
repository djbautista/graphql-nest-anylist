import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { List } from '@/lists/entities/list.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '@/common/dto/args';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

  create(createListInput: CreateListInput, user: User) {
    const newList = this.listsRepository.create(createListInput);
    newList.user = user;
    return this.listsRepository.save(newList);
  }

  findAll(
    user: User,
    paginationArgs: PaginationArgs = { offset: 0, limit: 10 },
    searchArgs: SearchArgs = { search: null },
  ) {
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listsRepository
      .createQueryBuilder('list')
      .where(`"userId" = :userId`, { userId: user.id })
      .take(limit)
      .skip(offset);

    if (search) {
      queryBuilder.andWhere(`LOWER(name) like :search`, {
        search: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User) {
    const list = await this.listsRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });

    if (!list) throw new NotFoundException(`List with id: ${id} not found`);

    return list;
  }

  async update(updateListInput: UpdateListInput, user: User) {
    await this.findOne(updateListInput.id, user);

    const list = await this.listsRepository.preload(updateListInput);

    if (!list)
      throw new NotFoundException(
        `List with id: ${updateListInput.id} not found`,
      );

    return this.listsRepository.save(list);
  }

  async remove(id: string, user: User) {
    const list = await this.findOne(id, user);

    await this.listsRepository.remove(list);

    return { ...list, id };
  }

  async countListsByUser(user: User) {
    return this.listsRepository.count({ where: { user: { id: user.id } } });
  }
}
