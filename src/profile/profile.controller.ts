import { Body, Controller, Get, HttpStatus, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt/jwt.guard';
import { IUser } from 'src/user/interfaces/user.interface';
import { User } from 'src/user/user.decorator';
import { ProfileDTO } from './dto/profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { InterestDTO } from './dto/interest.dto';

@ApiTags("Profile")
@Controller('profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService
    ) { }
    
    /**
     * @route   Get api/v1/profile
     * @desc    Get user profile
     * @method  Get
     * @access  Public
     */
    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiConsumes('application/json')
    @ApiOperation({ summary: 'who am i (Profile)' })
    async whoAmI(@User() user: IUser, @Res() res) {
      const result = await this.profileService.whoAmI(user);

      return res.status(HttpStatus.OK).json({
			  statusCode: HttpStatus.OK,
			  message: 'Get my data is successful',
			  data: result
		  });
    }
  
    /**
     * 
     * @route   Get api/v1/profile/about
     * @desc    Add or Change About
     * @param   user 
     * @param   input 
     * @method  Put
     * @access  Public 
     */
    @Post('about')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiConsumes('application/json')
    @ApiOperation({ summary: 'Add or Change About' })
    async syncAbout(
      @User() user: IUser,
		  @Body() input: ProfileDTO,
		  @Res() res
    ) {
		  const content = await this.profileService.addOrChangeAbout(user, input);
 
		  return res.status(HttpStatus.OK).json({
			  statusCode: HttpStatus.OK,
			  message: 'Success sync the about (profile).',
			  data: content
		  });
    }
    
    /**
     * 
     * @route   Get api/v1/profile/avatar
     * @desc    Add/Change the avatar
     * @param   file
     * @method  Post
     * @access  Public 
     */
    @Post('avatar')
    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Add or Change Avatar (Profile Picture)' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Image file to upload',
          },
        },
      },
    })
    async uploadAvatar(
      @User() user: IUser,
      @UploadedFile() file: Express.Multer.File,
      @Res() res
    ) {
      try {
        const profile = await this.profileService.updateAvatar(user._id, file);

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'Upload avatar is successful',
            data: profile
        });
      } catch (err) {
        throw new Error(err.message)
      }
    }
  
  /**
     * 
     * @route   Get api/v1/profile/interest
     * @desc    Add or Change interests
     * @param   input
     * @method  Post
     * @access  Public 
     */
    @Post('interest')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiConsumes('application/json')
    @ApiOperation({ summary: 'Add or Change Interests' })
    async interest(
      @User() user: IUser,
      @Body() input: InterestDTO,
		  @Res() res
    ) {
      try {
        const profile = await this.profileService.addOrChangeInterest(user, input);

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'Upload avatar is successful',
            data: profile
        });
      } catch (err) {
        throw new Error(err.message)
      }
    }
}
