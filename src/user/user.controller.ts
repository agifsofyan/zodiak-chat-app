import { 
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Res,
    HttpStatus,
    Query,
    Put,
    UseInterceptors,
    UploadedFile
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
import { SyncAboutDTO } from './dto/user-about.dto';
import { MinioService } from 'src/minio/minio.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags("Auth")
@Controller()
export class UserController {
    constructor(
        private userService: UserService,
        private readonly minioService: MinioService,
    ) { }

    /**
	 * @route   Get api/v1/check-account
	 * @desc    Check Account exists
     * @method  GET
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
     * @route   POST api/v1/register
     * @desc    Create a new user
     * @method  Post
     * @access  Public
     */
    @Post('register')
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
     * @route   Get api/v1/me
     * @desc    Get user data
     * @method  Get
     * @access  Public
     */
    @Get('me')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'who am i | Client' })
    async whoAmI(@User() user: IUser, @Res() res) {
        const result = await this.userService.whoAmI(user._id);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get my data is successful',
			data: result
		});
    }

    /**
     * 
     * @route   Get api/v1/about
     * @desc    Add or Change About
     * @param   user 
     * @param   input 
     * @method  Put
     * @access  Public 
     */
    @Put('about')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add or Change About (Profile)' })
    async syncAbout(
        @User() user: IUser,
		@Body() input: SyncAboutDTO,
		@Res() res
    ) {
        const userId = user._id
		const content = await this.userService.addOrChangeAbout(userId, input);
 
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success sync the about (profile).',
			data: content
		});
    }
    
    /**
     * 
     * @route   Get api/v1/avatar
     * @desc    Add/Change the avatar
     * @param   file
     * @method  Post
     * @access  Public 
     */
    @Post('avatar')
    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add or Change Avatar (Profile Picture)' })
    async uploadAvatar(
        @User() user: IUser,
        @UploadedFile() file: Express.Multer.File,
        @Res() res
    ) {
        if (!file) throw new Error('File not uploaded');

        let avatarUrl = ''

        let me = await this.userService.whoAmI(user._id)
        if (me) {
            let oldFileName = null
            
            if (me['avatar'] != "" && me['avatar'] != null && me['avatar'] != undefined) {
                oldFileName = me['avatar'].split('/').pop();
            }
        
            try {
                avatarUrl = await this.minioService.uploadAndOverwriteExistingFile(file, oldFileName);
            } catch (err) {
                throw new Error(err.message);
            }
        }

        try {
            const userId = user._id
            await this.userService.updateAvatar(userId, avatarUrl);

            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Upload avatar is successful',
                data: {
                    'avatar_url': avatarUrl
                }
            });
        } catch (err) {
            throw new Error(err.message)
        }
    }
}
