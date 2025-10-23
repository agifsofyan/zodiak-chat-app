import { Body, Controller, Delete, Get, HttpStatus, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt/jwt.guard';
import { IUser } from 'src/user/interfaces/user.interface';
import { User } from 'src/user/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { ProfileDTO } from './dto/profile.dto';

@ApiTags("Profile")
@Controller()
export class ProfileController {
    constructor(
        private profileService: ProfileService
    ) { }
    
    /**
     * @route   Get api/getProfile
     * @desc    Get user profile
     * @method  Get
     * @access  Public
     */
    @Get('getProfile')
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
     * @route   Get api/createProfile
     * @desc    Create Profile
     * @param   user 
     * @param   input 
     * @method  Post
     * @access  Public 
     */
    @Post('createProfile')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiConsumes('application/json')
    @ApiOperation({ summary: 'Create Profile' })
    async createProfile(
      @User() user: IUser,
		  @Body() input: ProfileDTO,
		  @Res() res
    ) {
		  const content = await this.profileService.addOrChangeProfile(user, input);
 
		  return res.status(HttpStatus.CREATED).json({
			  statusCode: HttpStatus.CREATED,
			  message: 'Success create profile.',
			  data: content
		  });
    }
  
    /**
     * 
     * @route   Get api/updateProfile
     * @desc    Update Profile
     * @param   user 
     * @param   input 
     * @method  Put
     * @access  Public 
     */
    @Post('updateProfile')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiConsumes('application/json')
    @ApiOperation({ summary: 'Update Profile' })
    async updateProfile(
      @User() user: IUser,
		  @Body() input: ProfileDTO,
		  @Res() res
    ) {
		  const content = await this.profileService.addOrChangeProfile(user, input);
 
		  return res.status(HttpStatus.OK).json({
			  statusCode: HttpStatus.OK,
			  message: 'Success update profile.',
			  data: content
		  });
    }
    
    /**
     * 
     * @route   Get api/uploadAvatar
     * @desc    Add/Change the avatar
     * @param   file
     * @method  Post
     * @access  Public 
     */
    @Post('uploadAvatar')
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
        const profile = await this.profileService.updateAvatar(user, file);

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
     * @route   Get api/removeAvatar
     * @desc    Remove the avatar
     * @param   file
     * @method  Delete
     * @access  Public 
     */
    @Delete('removeAvatar')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove Avatar (Profile Picture)' })
    async removeAvatar(
      @User() user: IUser,
      @Res() res
    ) {
      try {
        const profile = await this.profileService.deleteAvatar(user);

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'Remove avatar is successful',
            data: profile
        });
      } catch (err) {
        throw new Error(err.message)
      }
    }
}
