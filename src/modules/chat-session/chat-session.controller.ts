import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ChatSessionService } from './chat-session.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class ChatSessionController {
  constructor(private readonly chatSessionService: ChatSessionService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateChatSessionDto) {
    const userId = req.user.userId; 
    return this.chatSessionService.create(userId, dto.title);
  }

  @Get()
  async findAll(@Req() req) {
    const userId = req.user.userId;
    return this.chatSessionService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.chatSessionService.findOne(id, req.user.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return this.chatSessionService.delete(id, req.user.userId);
  }
}