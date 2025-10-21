import {
    IsNotEmpty,
    IsEmail,
    IsString,
    MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDTO {
    // Email
    @ApiProperty({
        example: 'zeroxstrong@gmail.com',
        description: 'Email',
        format: 'email'
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    // Password
    @ApiProperty({
        example: 'password',
        description: 'Password',
        format: 'string',
        minLength: 8
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;
}
