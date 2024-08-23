import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserParamDecorator } from 'src/auth/decorators/userParam.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Role } from 'src/auth/model/role';
import { UserArgs } from 'src/users/dto/args/user.args';
import { UpdateSelfInput, UpdateUserInput } from 'src/users/dto/inputs';

import { ItemsService } from '@/items/items.service';
import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import { Item } from '@/items/entities/item.entity';
import { PaginationArgs, SearchArgs } from '@/common/dto/args';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args() args: UserArgs,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
    @UserParamDecorator([Role.admin]) _,
  ): Promise<User[]> {
    return this.usersService.findAll(args, paginationArgs, searchArgs);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @UserParamDecorator([Role.admin]) _,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  update(
    @Args('userInput') updateUserInput: UpdateUserInput,
    @UserParamDecorator([Role.admin]) admin: User,
  ) {
    return this.usersService.update(updateUserInput, admin);
  }

  @Mutation(() => User, { name: 'updateSelf' })
  updateSelf(
    @Args('selfInput') updateUserInput: UpdateSelfInput,
    @UserParamDecorator() user: User,
  ) {
    return this.usersService.update({ ...updateUserInput, id: user.id }, user);
  }

  @Mutation(() => User, { name: 'banUser' })
  banUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @UserParamDecorator([Role.admin]) user: User,
  ) {
    return this.usersService.ban(id, user);
  }

  @ResolveField(() => Int)
  async itemsCount(@Parent() user: User): Promise<number> {
    return await this.itemsService.countItemsByUser(user);
  }

  @ResolveField(() => [Item])
  async items(
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return await this.itemsService.findAll(user, paginationArgs, searchArgs);
  }
}
