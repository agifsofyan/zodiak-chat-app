import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationType } from '../schemas/chat-conversation';

export class CreateConversationDto {
  @ApiProperty({ description: 'Participant User ID (for private chat)' })
  @IsMongoId()
  @IsOptional()
  participantId?: string;
}

export class CreateGroupDto {
  @ApiProperty({ description: 'Group name', example: 'Zodiak Lovers' })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({
    description: 'Array of user IDs to add to group',
    example: ['userId1', 'userId2', 'userId3'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(2, {
    message: 'Group must have at least 3 members including creator',
  })
  @ArrayMaxSize(100, { message: 'Group cannot have more than 100 members' })
  participants: string[];

  @ApiPropertyOptional({
    enum: ConversationType,
    default: ConversationType.GROUP,
  })
  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType = ConversationType.GROUP;
}

export class AddMemberDto {
  @ApiProperty({ description: 'User ID to add' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}

export class UpdateGroupDto {
  @ApiPropertyOptional({ description: 'New group name' })
  @IsString()
  @IsOptional()
  groupName?: string;
}

export class DemoteAdminDto {
  @ApiProperty({ description: 'Action: promote or demote' })
  @IsString()
  @IsNotEmpty()
  action: 'promote' | 'demote';
}
