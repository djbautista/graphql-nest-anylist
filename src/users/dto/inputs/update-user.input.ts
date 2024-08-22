import { IsUUID } from 'class-validator';

import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

import { UpdateSelfInput } from './';

@InputType()
export class UpdateUserInput extends PartialType(UpdateSelfInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;
}
