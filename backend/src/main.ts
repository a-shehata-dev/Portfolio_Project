import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionsRecorderFilter } from './common/filters/global-exceptions-recorder.filter';
import { PrismaService } from 'prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { createPublicFolders } from '@common/helpers/create-public-folders';
import { initializeSessions } from '@common/helpers/init-sessions';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
dotenv.config();

async function bootstrap() {
  //! Password is a must , therefore it should be set
  const password = process.env.PASSWORD;
  if (!password) {
    console.log(`Please set the 'PASSWORD' environment variable.`);
    process.exit(1);
  }

  createPublicFolders();
  const app = await NestFactory.create(AppModule);
  initializeSessions(app);

  //! Swagger
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  //! Global Exception Filter
  app.useGlobalFilters(
    new GlobalExceptionsRecorderFilter(app.get(PrismaService)),
  );

  //! Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //! CORS
  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN,
      process.env.WWW_CORS_ORIGIN,
      'http://localhost:5173',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
