import { UserParamDecorator } from 'src/auth/decorators/userParam.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Role } from 'src/auth/model/role';
import { UserArgs } from 'src/users/dto/args/user.args';

import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateSelfInput, UpdateUserInput } from 'src/users/dto/inputs';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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
}
