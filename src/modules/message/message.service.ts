import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class MessageService {
  private readonly model;

  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // أحدث وأسرع موديل
  }

  async create(sessionId: string, sender: 'user' | 'bot', content: string) {
    // 1️⃣ حفظ رسالة المستخدم
    const userMessage = await this.messageModel.create({
      session: sessionId,
      sender,
      content,
    });

    // 2️⃣ لو المرسل المستخدم، استدعي Gemini ورد بالبوت
    if (sender === 'user') {
      const result = await this.model.generateContent(content);
      const botResponse = result.response.text();

      const botMessage = await this.messageModel.create({
        session: sessionId,
        sender: 'bot',
        content: botResponse,
      });

      return { userMessage, botMessage };
    }

    return userMessage;
  }

  async findBySession(sessionId: string) {
    return this.messageModel.find({ session: sessionId }).sort({ createdAt: 1 });
  }

  async deleteBySession(sessionId: string) {
    await this.messageModel.deleteMany({ session: sessionId });
    return { message: 'All messages deleted for this session' };
  }
}