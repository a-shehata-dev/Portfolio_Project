import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { PrismaService } from 'prisma/prisma.service';
import { LogsController } from './logs.controller';

@Module({
  controllers: [LogsController],
  providers: [LogsService, PrismaService],
  exports: [LogsService],
})
export class LogsModule {}
