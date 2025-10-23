import { 
    Controller,
    Post,
    Body,
    Res,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiConsumes
} from '@nestjs/swagger';

import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserService } from './user.service';

@ApiTags("Auth")
@Controller()
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    /**
     * @route   POST api/v1/register
     * @desc    Create a new user
     * @method  Post
     * @access  Public
     */
    @Post('register')
    @ApiConsumes('application/json')
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
     * @route   POST api/v1/login
     * @desc    Authenticate user
     * @method  Post
     * @access  Public
     */
    @Post('login')
    @ApiConsumes('application/json')
    @ApiOperation({ summary: 'User login' })
    async login(@Body() userLoginDTO: UserLoginDTO, @Res() res) {
        const result = await this.userService.login(userLoginDTO);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'login is successful',
			data: result
		});
    }
}
