import * as bcrypt from 'bcrypt';
import { SignUpInput } from 'src/auth/dto/inputs';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserArgs } from 'src/users/dto/args/user.args';
import { UpdateUserInput } from 'src/users/dto/inputs';
import { PaginationArgs, SearchArgs } from '@/common/dto/args';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private handleDBError(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Internal Server Error');
  }

  async create(signUpInput: SignUpInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signUpInput,
        password: await bcrypt.hashSync(signUpInput.password, 10),
      });

      newUser.lastModifiedBy = newUser;

      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findAll(
    args: UserArgs,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;
    const { roles } = args;

    const queryBuilder = this.usersRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset);

    if (roles?.length) {
      queryBuilder
        .andWhere('ARRAY[roles] && ARRAY[:...roles]')
        .setParameters({ roles });
    }

    if (search) {
      queryBuilder.andWhere('LOWER("fullName") like :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async update(
    updateUserInput: UpdateUserInput,
    modifiedBy: User,
  ): Promise<User> {
    const user = await this.usersRepository.preload(updateUserInput);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    user.lastModifiedBy = modifiedBy;

    return await this.usersRepository.save(user);
  }

  async ban(id: string, admin: User): Promise<User> {
    const user = await this.findOneById(id);

    user.isActive = false;

    user.lastModifiedBy = admin;

    return await this.usersRepository.save(user);
  }
}
