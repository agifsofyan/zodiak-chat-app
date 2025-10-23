import {
    IsEnum,
    IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from './enum-gender.dto';

export class AboutDTO {
    // Avatar (About Picture)
    @ApiProperty({
        example: 'https://s3.ap-southeast-1.amazonaws.com/cdn.dummy.com/connect/users/abouts/user-icon.png',
        description: 'Avatar (About Picture)',
        format: 'string'
    })
    avatar: string;

    // Gender
    @ApiProperty({
        description: 'Gender is enum (male, female)',
        enum: Gender,
        example: Gender.MALE,
    })
    @IsEnum(Gender, { message: 'Gender must be either male or female' })
    gender: Gender;

    // Birthday
    @ApiProperty({
        example: '1995-01-15T00:00:00.000Z',
        description: 'Birthday in ISO 8601 format',
        format: 'date'
    })
    @IsISO8601({ strict: false, strictSeparator: true })
    // @Type(() => Date)
    birthday: Date;

    // Horoscope
    @ApiProperty({
        example: 'aries',
        description: 'Horoscope',
        format: 'string',
    })
    horoscope: string;

    // Zodiac
    @ApiProperty({
        example: 'pig',
        description: 'Zodiac',
        format: 'string',
    })
    zodiac: string;

    // Height
    @ApiProperty({
        example: 175,
        description: 'Height (cm)',
        format: 'number',
    })
    height: number;

    // Weight
    @ApiProperty({
        example: 69,
        description: 'Weight (kg)',
        format: 'number',
    })
    weight: number;
}