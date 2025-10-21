import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors: true});

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.useWebSocketAdapter(new WsAdapter(app) as any);

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .setTitle('zodiac-chat-api-v1')
    .setDescription(`API ${process.env.NODE_ENV}.`)
    .setVersion('1.0')
    // .addBearerAuth({ type: "apiKey", in: "header", name: "Authorization", description: "HTTP/HTTP Bearer" })
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", description: "HTTP/HTTP Bearer" })
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options);    
  SwaggerModule.setup('api/v1/docs', app, document);

  const config = app.get(ConfigService)
  const port = config.get<string>('API_PORT')
  await app.listen(port);

  console.log(`\n[API] zodiac-chat-api started running in ${process.env.NODE_ENV} mode on port ${port}\n`);
}
bootstrap();
