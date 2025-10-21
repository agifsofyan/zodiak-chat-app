import {
    IsNotEmpty,
    MinLength,
    IsEmail,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDTO {
    // Email
    @ApiProperty({
        example: 'johndoe@gmail.com',
        description: 'Email',
        format: 'email',
        uniqueItems: true
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
    
    // Name
    @ApiProperty({
        example: 'New User',
        description: 'User name',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    // Password
    @ApiProperty({
        example: '57ghrwi023',
        description: 'Password',
        format: 'string',
        minLength: 8
    })
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}