import { UserParamDecorator } from 'src/auth/decorators/userParam.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Role } from 'src/auth/model/role';
import { UserArgs } from 'src/users/dto/args/user.args';

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

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateSelfInput, UpdateUserInput } from 'src/users/dto/inputs';
import { ItemsService } from '@/items/items.service';

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
    @UserParamDecorator([Role.admin]) _,
  ): Promise<User[]> {
    console.log({ args });
    return this.usersService.findAll(args);
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
}
