import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LOG_TYPES_SEEDER, LogType } from './logs.types';
import { PaginationFilter } from '@common/types/pagination.dto';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '@common/constraints/constraints.common';
import { DurationSearchDto } from './dtos/duration-search.dto';
import { setDateToMax, setDateToMin } from '@common/helpers/format-date';

@Injectable()
export class LogsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  //! ================= SEED LOGS TYPES =================
  async onModuleInit() {
    // Seed Types
    let counter = 0;
    for (const type of LOG_TYPES_SEEDER) {
      const found = await this.prisma.logs_Types.findFirst({ where: { type } });
      if (!found) {
        await this.prisma.logs_Types.create({ data: { type } });
        counter++;
      }
    }
    if (counter === LOG_TYPES_SEEDER.length) {
      await this.createLog('Logs Types were successfully seeded', 'SYSTEM');
      console.log('Logs Types were successfully seeded');
    }
  }

  //! ================= CREATE LOG =================
  async createLog(text: string, type: LogType, ip?: string) {
    const typeRow = await this.prisma.logs_Types.findFirst({ where: { type } });
    if (!typeRow) {
      throw new Error('Type not found');
    }
    try {
      return await this.prisma.logs.create({
        data: { log: text, type: typeRow.id, ip },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  //! ================================================= Find Many =================================================
  async findMany(query: DurationSearchDto) {
    let typeID: number | undefined = undefined;
    if (query.type) {
      const type = await this.prisma.logs_Types.findFirst({
        where: { type: query.type },
      });
      typeID = type?.id;
    }
    const pageSize = query.pageSize
      ? Number(query.pageSize)
      : DEFAULT_PAGE_SIZE;
    const page = query.page ? Number(query.page) : DEFAULT_PAGE_NUMBER;

    const data = await this.prisma.logs.findMany({
      where: {
        type: typeID ? typeID : undefined,
        ...(query.startDate && {
          date: { gte: setDateToMin(query.startDate) },
        }),
        ...(query.endDate && { date: { lte: setDateToMax(query.endDate) } }),
      },
      orderBy: {
        date:
          query.sort === 'newest'
            ? 'desc'
            : query.sort === 'oldest'
              ? 'asc'
              : undefined,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        Logs_Types: true,
      },
    });

    const formattedData = data.map(({ Logs_Types, ...rest }) => ({
      ...rest,
      type: Logs_Types.type, // Replace numeric type with string
    }));
    return formattedData;
  }
}
