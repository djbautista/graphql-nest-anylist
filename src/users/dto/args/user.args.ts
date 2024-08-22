import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';
import { Role } from 'src/auth/model/role';

@ArgsType()
export class UserArgs {
  @Field(() => [Role], { nullable: true })
  @IsArray()
  roles: Role[] = [];
}
