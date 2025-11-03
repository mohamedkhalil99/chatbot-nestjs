import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsIn(['user', 'bot'])
  sender: 'user' | 'bot';
}