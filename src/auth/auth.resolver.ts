import { Injectable, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { UserParamDecorator } from 'src/auth/decorators/userParam.decorator';
import { SignUpInput, SignInInput } from 'src/auth/dto/inputs';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Role } from 'src/auth/model/role';
import { AuthResponse } from 'src/auth/types/authResponse.type';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signUp' })
  async signUp(
    @Args('signUpInput') signUpInput: SignUpInput,
  ): Promise<AuthResponse> {
    return this.authService.signUp(signUpInput);
  }

  @Mutation(() => AuthResponse, { name: 'signIn' })
  async signIn(
    @Args('signInInput') signInInput: SignInInput,
  ): Promise<AuthResponse> {
    return this.authService.signIn(signInInput);
  }

  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(@UserParamDecorator() user: User): AuthResponse {
    return this.authService.revalidateToken(user);
  }
}
