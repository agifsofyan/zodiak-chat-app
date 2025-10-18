import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';

const {
	// MONGO_DB_URI,
	API_PORT,
	DB_USER,
	DB_PASS,
	DB_HOST,
	DB_PORT,
	DB_NAME, 
	DB_AUTH,
	JWT_SECRET,
	JWT_EXPIRATION,
	JWT_ENCRYPT_SECRETKEY
} = process.env;

const URI = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH}`;

export const MONGO_DB_CONNECTION = MongooseModule.forRoot(URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

export const PORT = `${API_PORT}`;
export const MONGO_URI = `${URI}`;
export const JWT_SECRET_KEY = `${JWT_SECRET}`;
export const JWT_ENCRYPT_SECRET_KEY = `${JWT_ENCRYPT_SECRETKEY}`;
export const JWT_EXPIRATION_TIME = `${JWT_EXPIRATION}`;