import { PaginationFilter } from '@common/types/pagination.dto';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class DurationSearchDto extends PaginationFilter {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}
