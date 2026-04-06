import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpStatus,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards/jwt/jwt.guard';
import { User } from './user.decorator';
import { IUser } from './interfaces/user.interface';

@ApiTags('Auth')
@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * @route   POST api/register
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
      data: result,
    });
  }

  /**
   * @route   POST api/login
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
      data: result,
    });
  }

  /**
   * @route   GET api/users
   * @desc    Get all users (for finding chat participants)
   * @method  Get
   * @access  Private
   */
  @Get('users')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (for finding participants)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getUsers(
    @User() user: IUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Res() res,
  ) {
    const users = await this.userService.findAll(user._id, limit, page);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Users fetched successfully',
      data: users,
    });
  }

  /**
   * @route   GET api/users/search
   * @desc    Search users by name or email
   * @method  Get
   * @access  Private
   */
  @Get('users/search')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async searchUsers(
    @User() user: IUser,
    @Query('q') query: string,
    @Res() res,
  ) {
    const users = await this.userService.search(query, user._id);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Search results',
      data: users,
    });
  }

  /**
   * @route   GET api/users/:id
   * @desc    Get user by ID
   * @method  Get
   * @access  Private
   */
  @Get('users/:id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') userId: string, @Res() res) {
    const user = await this.userService.findById(userId);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        data: null,
      });
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      data: user,
    });
  }
}
