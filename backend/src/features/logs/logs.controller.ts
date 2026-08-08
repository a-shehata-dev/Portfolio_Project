import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { PaginationFilter } from '@common/types/pagination.dto';
import { DurationSearchDto } from './dtos/duration-search.dto';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  //! ================================================= FIND MANY =================================================
  @Get()
  async findMany(@Query() query: DurationSearchDto) {
    return await this.logsService.findMany(query);
  }
}
