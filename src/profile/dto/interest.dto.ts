import {
    IsEnum,
    IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from './enum-gender.dto';

export class InterestDTO {
    // Avatar (About Picture)
    @ApiProperty({
        example: 'https://www.dummy.com/user-icon.png',
        description: 'Avatar (About Picture)',
        format: 'string'
    })
    avatar: string;
}