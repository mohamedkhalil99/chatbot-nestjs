import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { ChatSessionService } from './chat-session.service';
import { ChatSessionController } from './chat-session.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChatSession.name, schema: ChatSessionSchema }]),],
  controllers: [ChatSessionController],
  providers: [ChatSessionService],
  exports: [ChatSessionService],
})
export class ChatSessionModule {}