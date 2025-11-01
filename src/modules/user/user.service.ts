import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByGoogleId(googleId: string): Promise<Record<string, any> | null> {
    return this.userModel.findOne({ googleId }).lean().exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ googleId: createUserDto.googleId });
    if (existingUser) return existingUser; 
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }
}