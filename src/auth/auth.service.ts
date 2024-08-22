import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { SignInInput, SignUpInput } from 'src/auth/dto/inputs';
import { AuthResponse } from 'src/auth/types/authResponse.type';
import { UsersService } from 'src/users/users.service';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private generateJwtToken(user: User) {
    return this.jwtService.sign({ sub: user.id, name: user.fullName });
  }

  async signUp(signUpInput: SignUpInput): Promise<AuthResponse> {
    const user = await this.userService.create(signUpInput);

    const token = this.generateJwtToken(user);

    return { token, user };
  }

  async signIn({ email, password }: SignInInput): Promise<AuthResponse> {
    const user = await this.userService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('User and password do not match');
    }

    const token = this.jwtService.sign({ sub: user.id, name: user.fullName });

    return { token, user };
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.generateJwtToken(user);

    return { token, user };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);

    if(!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    delete user.password;

    return user;
  }
}
