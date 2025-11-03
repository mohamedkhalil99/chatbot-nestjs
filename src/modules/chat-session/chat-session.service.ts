import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatSession } from './schemas/chat-session.schema';

@Injectable()
export class ChatSessionService {
  constructor(@InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSession>) {}

  async create(userId: string, title?: string) {
    const session = new this.chatSessionModel({ user: userId, title });
    return session.save();
  }

  async findAllByUser(userId: string) {
    return this.chatSessionModel.find({ user: userId }).populate('user', 'name email avatar').sort({ createdAt: -1 });
  }

  async findOne(sessionId: string, userId: string) {
    const session = await this.chatSessionModel.findOne({ _id: sessionId, user: userId });
    if (!session) throw new NotFoundException('Session not found or access denied');
    return session;
  }

  async delete(sessionId: string, userId: string) {
    const session = await this.chatSessionModel.findOneAndDelete({ _id: sessionId, user: userId });
    if (!session) throw new NotFoundException('Session not found or access denied');
    return { message: 'Session deleted successfully' };
  }
}