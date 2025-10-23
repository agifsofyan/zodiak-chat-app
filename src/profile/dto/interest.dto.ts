import {
    IsEnum,
    IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from './enum-gender.dto';

export class InterestDTO {
    // Avatar (Profile Picture)
    @ApiProperty({
        example: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/users/profiles/user-icon.png',
        description: 'Avatar (Profile Picture)',
        format: 'string'
    })
    avatar: string;
}