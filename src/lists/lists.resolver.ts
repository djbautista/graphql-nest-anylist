import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserParamDecorator } from '@/auth/decorators/userParam.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '@/common/dto/args';
import { ListItem } from '@/list-item/entities/list-item.entity';
import { ListItemService } from '../list-item/list-item.service';
import { Item } from '@/items/entities/item.entity';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService,
  ) {}

  @Mutation(() => List)
  createList(
    @Args('createListInput') createListInput: CreateListInput,
    @UserParamDecorator() user: User,
  ) {
    return this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  findAll(
    @UserParamDecorator() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ) {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @UserParamDecorator() user: User,
  ) {
    return this.listsService.findOne(id, user);
  }

  @Mutation(() => List)
  updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @UserParamDecorator() user: User,
  ) {
    return this.listsService.update(updateListInput, user);
  }

  @Mutation(() => List)
  removeList(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @UserParamDecorator() user: User,
  ) {
    return this.listsService.remove(id, user);
  }

  @ResolveField(() => Int, { name: 'itemsCount' })
  async itemsCount(@Parent() list: List): Promise<number> {
    return this.listItemService.countItemsByList(list);
  }

  @ResolveField(() => [ListItem], { name: 'items' })
  async listItems(
    @Parent() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    return this.listItemService.findAllByList(list, paginationArgs, searchArgs);
  }
}
