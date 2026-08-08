export const LOG_INFO_CONST = 'INFO';
export const LOG_ERROR_CONST = 'ERROR';
export const LOG_SYSTEM_CONST = 'SYSTEM';
export const LOG_WARNING_CONST = 'WARNING';
export const LOG_TYPES_SEEDER = [
  LOG_INFO_CONST,
  LOG_ERROR_CONST,
  LOG_SYSTEM_CONST,
  LOG_WARNING_CONST,
];
export type LogType =
  | typeof LOG_INFO_CONST
  | typeof LOG_ERROR_CONST
  | typeof LOG_SYSTEM_CONST
  | typeof LOG_WARNING_CONST;
