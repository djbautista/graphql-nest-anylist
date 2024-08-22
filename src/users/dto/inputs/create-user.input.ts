import { SignUpInput } from 'src/auth/dto/inputs';

import { InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput extends SignUpInput {}
