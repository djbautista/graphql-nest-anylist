import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from 'src/auth/model/role';
import { User } from 'src/users/entities/user.entity';

export const UserParamDecorator = createParamDecorator(
  (roles: Role[] = [], executionContext: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(executionContext);

    const user: User = ctx.getContext().req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found but required');
    }

    if (!roles.length) return user;

    const forbidden = roles.some((role) => !user.roles.includes(role.toString()));

    if (forbidden) {
      throw new ForbiddenException('Forbidden');
    }

    return user;
  },
);
