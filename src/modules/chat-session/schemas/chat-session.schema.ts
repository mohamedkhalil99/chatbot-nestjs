import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/modules/user/schemas/user.schema';

export type ChatSessionDocument = HydratedDocument<ChatSession>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ChatSession {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User | Types.ObjectId;

  @Prop({ default: 'New Chat' })
  title: string;

  createdAt: Date;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);