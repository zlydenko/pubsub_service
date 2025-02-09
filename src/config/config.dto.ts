import { IsInt, IsOptional, IsString } from "class-validator";

import { DEFAULT_CONFIG, IConfig } from "./config.constants";

export class EnvironmentVariablesDto implements IConfig {
  @IsString()
  REDIS_HOST: string = DEFAULT_CONFIG.REDIS_HOST;

  @IsInt()
  REDIS_PORT: number = DEFAULT_CONFIG.REDIS_PORT;

  @IsOptional()
  @IsString()
  NODE_ENV?: string = DEFAULT_CONFIG.NODE_ENV;

  @IsInt()
  PORT: number = DEFAULT_CONFIG.PORT;

  @IsString()
  INPUT_LIMIT: string = DEFAULT_CONFIG.INPUT_LIMIT;
}