import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Item } from '@/items/entities/item.entity';
import { List } from '@/lists/entities/list.entity';

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  fullName: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', array: true, default: ['user'] })
  @Field(() => [String])
  roles: string[];

  @Column({ type: 'boolean', default: true })
  @Field(() => Boolean)
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.lastModifiedBy, {
    nullable: true,
    lazy: true,
  })
  @JoinColumn({ name: 'lastModifiedBy' })
  @Field(() => User, { nullable: true })
  lastModifiedBy?: User;

  @OneToMany(() => Item, (item) => item.user, { lazy: true })
  items: Item[];

  @OneToMany(() => List, (list) => list.user, { lazy: true })
  lists: List[];
}
