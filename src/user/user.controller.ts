import { 
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Res,
    HttpStatus,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiQuery
} from '@nestjs/swagger';

import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserService } from './user.service';
import { User } from './user.decorator';
import { IUser } from './interfaces/user/user.interface';
import { JwtGuard } from '../auth/guards/jwt/jwt.guard';

@ApiTags("Users")
@UseGuards()
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    /**
	 * @route   Get api/v1/users/check-account
	 * @desc    Check OTP exists
	 * @access  Public
	 */

    @Get('check-account')
    @ApiOperation({ summary: 'Check Account exists | Free' })
    
    @ApiQuery({
		name: 'email',
		required: false,
		explode: true,
		type: String,
        isArray: false,
        example: 'kirana@gmail.com'
    })

	async checkAccount(@Res() res,  @Query('email') email: string) {
		const result = await this.userService.checkAccount(email)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'account is valid',
            data: result
        });
    }

    /**
     * @route   POST api/v1/users
     * @desc    Create a new user
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'User registration' })
    async register(@Body() userRegisterDTO: UserRegisterDTO, @Res() res) {
        const result = await this.userService.create(userRegisterDTO);

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Registration is successful',
			data: result
		});
    }

    /**
     * @route   POST api/v1/users/login
     * @desc    Authenticate user
     * @access  Public
     */
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    async login(@Body() userLoginDTO: UserLoginDTO, @Res() res) {
        const result = await this.userService.login(userLoginDTO);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'login is successful',
			data: result
		});
    }

    /**
     * @route   Get api/v1/users/me
     * @desc    Get user data
     * @access  Public
     */
    @Get('me')
    @UseGuards(JwtGuard)
	// @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'who am i | Client' })
    
    async whoAmI(@User() user: IUser, @Res() res) {
        const result = await this.userService.whoAmI(user);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get my data is successful',
			data: result
		});
    }
}
