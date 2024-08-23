import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/users/entities/user.entity';
import { ListItem } from '@/list-item/entities/list-item.entity';

@Entity({ name: 'lists' })
@ObjectType()
export class List {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @ManyToOne(() => User, (user) => user.lists, { nullable: false })
  @Index('list_user_id_index')
  user: User;

  @OneToMany(() => ListItem, (listItem) => listItem.list, { lazy: true })
  listItems: ListItem[];
}
