import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_ENV = ConfigModule.forRoot({
	isGlobal: true, // agar bisa diakses di semua tempat
	envFilePath: '.env', // default juga .env
	validationSchema: Joi.object({
		API_PORT: Joi.number().default(3000),

		DB_USER: Joi.string().allow('').optional(),
		DB_PASS: Joi.string().allow('').optional(),
		DB_HOST: Joi.string().required(),
		DB_PORT: Joi.number().default(27017),
		DB_NAME: Joi.string().required(),
		DB_AUTH: Joi.string().allow('').optional(),

		JWT_SECRET_KEY: Joi.string().required(),
		JWT_EXPIRATION: Joi.string().default('1d'),
		JWT_ENCRYPT_SECRET_KEY: Joi.string().required(),
	}),
})