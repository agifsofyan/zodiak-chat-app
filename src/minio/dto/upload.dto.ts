import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UploadImageDTO {
    // Upload File
    @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (jpg, jpeg, png)',
  })
  @IsOptional()
  file?: Express.Multer.File;
}