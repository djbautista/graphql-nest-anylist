import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Role } from 'src/auth/model/role';

import { Field, InputType, PartialType } from '@nestjs/graphql';

import { CreateUserInput } from './';

@InputType()
export class UpdateSelfInput extends PartialType(CreateUserInput) {
  @Field(() => [Role], { nullable: true })
  @IsArray()
  @IsOptional()
  roles?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
