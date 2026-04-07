import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt/jwt.guard';
import { ChatService } from './chat.service';
import {
  CreateConversationDto,
  CreateGroupDto,
  AddMemberDto,
  UpdateGroupDto,
  DemoteAdminDto,
} from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  async getConversations(@User() user: IUser, @Res() res) {
    const conversations = await this.chatService.getConversations(user._id);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Conversations fetched successfully',
      data: conversations,
    });
  }

  @Post('conversation/:participantId')
  @ApiOperation({ summary: 'Create or get conversation with a participant' })
  @ApiParam({ name: 'participantId', description: 'User ID of participant' })
  async createOrGetConversation(
    @User() user: IUser,
    @Param('participantId') participantId: string,
    @Res() res,
  ) {
    const conversation = await this.chatService.createOrGetConversation(
      user._id,
      participantId,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Conversation fetched successfully',
      data: conversation,
    });
  }

  @Get('messages/:conversationId')
  @ApiOperation({
    summary: 'Get messages in a conversation (auto mark as read)',
  })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getMessages(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Res() res,
  ) {
    const messages = await this.chatService.getMessagesAndMarkAsRead(
      conversationId,
      user._id,
      page,
      limit,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Messages fetched successfully',
      data: messages,
    });
  }

  @Get('unread/:conversationId')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  async getUnreadCount(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Res() res,
  ) {
    const count = await this.chatService.getUnreadCount(
      conversationId,
      user._id,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Unread count fetched successfully',
      data: { count },
    });
  }

  @Post('message')
  @ApiOperation({ summary: 'Send a message' })
  @ApiBody({ type: CreateMessageDto })
  async sendMessage(
    @User() user: IUser,
    @Body() createMessageDto: CreateMessageDto,
    @Res() res,
  ) {
    const message = await this.chatService.createMessage(
      createMessageDto.conversationId,
      user._id,
      createMessageDto.content,
      createMessageDto.type || 'text',
      createMessageDto.replyTo,
    );

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'Message sent successfully',
      data: message,
    });
  }

  @Post('read-all/:conversationId')
  @ApiOperation({ summary: 'Mark all messages as read in a conversation' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  async markAllAsRead(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Res() res,
  ) {
    const result = await this.chatService.markAllAsRead(
      conversationId,
      user._id,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: `Marked ${result.modifiedCount} messages as read`,
      data: result,
    });
  }

  @Post('group')
  @ApiOperation({ summary: 'Create a group chat' })
  @ApiBody({ type: CreateGroupDto })
  async createGroup(
    @User() user: IUser,
    @Body() createGroupDto: CreateGroupDto,
    @Res() res,
  ) {
    const conversation = await this.chatService.createGroup(
      user._id,
      createGroupDto.groupName,
      createGroupDto.participants,
    );

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'Group created successfully',
      data: conversation,
    });
  }

  @Get('group/:conversationId')
  @ApiOperation({ summary: 'Get group info' })
  @ApiParam({ name: 'conversationId', description: 'Group ID' })
  async getGroupInfo(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Res() res,
  ) {
    const conversation = await this.chatService.getGroupInfo(
      conversationId,
      user._id,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Group info fetched successfully',
      data: conversation,
    });
  }

  @Put('group/:conversationId')
  @ApiOperation({ summary: 'Update group name (admin only)' })
  @ApiParam({ name: 'conversationId', description: 'Group ID' })
  @ApiBody({ type: UpdateGroupDto })
  async updateGroup(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Res() res,
  ) {
    const conversation = await this.chatService.updateGroup(
      conversationId,
      user._id,
      updateGroupDto.groupName,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Group updated successfully',
      data: conversation,
    });
  }

  @Post('group/:conversationId/member')
  @ApiOperation({ summary: 'Add member to group (admin only)' })
  @ApiParam({ name: 'conversationId', description: 'Group ID' })
  @ApiBody({ type: AddMemberDto })
  async addMember(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Body() addMemberDto: AddMemberDto,
    @Res() res,
  ) {
    const conversation = await this.chatService.addMember(
      conversationId,
      user._id,
      addMemberDto.userId,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Member added successfully',
      data: conversation,
    });
  }

  @Delete('group/:conversationId/member/:userId')
  @ApiOperation({ summary: 'Remove member from group (admin only)' })
  @ApiParam({ name: 'conversationId', description: 'Group ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  async removeMember(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
    @Res() res,
  ) {
    const conversation = await this.chatService.removeMember(
      conversationId,
      user._id,
      userId,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Member removed successfully',
      data: conversation,
    });
  }

  @Post('group/:conversationId/leave')
  @ApiOperation({ summary: 'Leave group' })
  @ApiParam({ name: 'conversationId', description: 'Group ID' })
  async leaveGroup(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Res() res,
  ) {
    const result = await this.chatService.leaveGroup(conversationId, user._id);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  }

  @Delete('group/:conversationId')
  @ApiOperation({ summary: 'Delete group (admin only)' })
  @ApiParam({ name: 'conversationId', description: 'Group ID' })
  async deleteGroup(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Res() res,
  ) {
    const result = await this.chatService.deleteGroup(conversationId, user._id);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  }

  @Post('group/:conversationId/admin/:userId')
  @ApiOperation({ summary: 'Demote or promote admin' })
  @ApiParam({ name: 'conversationId', description: 'Group ID' })
  @ApiParam({ name: 'userId', description: 'New admin user ID' })
  @ApiBody({ type: DemoteAdminDto })
  async demoteAdmin(
    @User() user: IUser,
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
    @Body() demoteAdminDto: DemoteAdminDto,
    @Res() res,
  ) {
    if (demoteAdminDto.action === 'demote') {
      const conversation = await this.chatService.demoteAdmin(
        conversationId,
        user._id,
        userId,
      );

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Admin demoted successfully',
        data: conversation,
      });
    }

    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid action',
    });
  }

  @Delete('message/:messageId')
  @ApiOperation({ summary: 'Delete message (owner or admin only)' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiQuery({
    name: 'conversationId',
    required: true,
    description: 'Conversation ID',
  })
  async deleteMessage(
    @User() user: IUser,
    @Param('messageId') messageId: string,
    @Query('conversationId') conversationId: string,
    @Res() res,
  ) {
    const result = await this.chatService.deleteMessage(
      conversationId,
      messageId,
      user._id,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  }

  @Post('message/:messageId/recall')
  @ApiOperation({ summary: 'Recall message (owner only)' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiQuery({
    name: 'conversationId',
    required: true,
    description: 'Conversation ID',
  })
  async recallMessage(
    @User() user: IUser,
    @Param('messageId') messageId: string,
    @Query('conversationId') conversationId: string,
    @Res() res,
  ) {
    const result = await this.chatService.recallMessage(
      conversationId,
      messageId,
      user._id,
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  }
}
