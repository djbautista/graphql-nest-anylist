import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserParamDecorator } from '@/auth/decorators/userParam.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { CreateItemInput, UpdateItemInput } from '@/items/dto/inputs';
import { Item } from '@/items/entities/item.entity';
import { ItemsService } from '@/items/items.service';
import { User } from '@/users/entities/user.entity';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Mutation(() => Item)
  async createItem(
    @Args('createItemInput') createItemInput: CreateItemInput,
    @UserParamDecorator() user: User,
  ): Promise<Item> {
    return this.itemsService.create(createItemInput, user);
  }

  @Query(() => [Item], { name: 'items' })
  async findAll(@UserParamDecorator() user: User): Promise<Item[]> {
    return this.itemsService.findAll(user);
  }

  @Query(() => Item, { name: 'item' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @UserParamDecorator() user: User,
  ): Promise<Item> {
    return this.itemsService.findOne(id, user);
  }

  @Mutation(() => Item)
  updateItem(
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
    @UserParamDecorator() user: User,
  ): Promise<Item> {
    return this.itemsService.update(updateItemInput.id, updateItemInput, user);
  }

  @Mutation(() => Item)
  removeItem(
    @Args('id', { type: () => ID }) id: string,
    @UserParamDecorator() user: User,
  ): Promise<Item> {
    return this.itemsService.remove(id, user);
  }
}
