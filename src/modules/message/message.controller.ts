import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':sessionId')
  async create(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messageService.create(sessionId, dto.sender, dto.content);
  }

  @Get(':sessionId')
  async findAll(@Param('sessionId') sessionId: string) {
    return this.messageService.findBySession(sessionId);
  }

  @Delete(':sessionId')
  async deleteAll(@Param('sessionId') sessionId: string) {
    return this.messageService.deleteBySession(sessionId);
  }
}
