export interface IConfig {
  REDIS_HOST: string;
  REDIS_PORT: number;
  NODE_ENV?: string;
  PORT: number;
  INPUT_LIMIT: string;
}

export const DEFAULT_CONFIG: IConfig = {
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  NODE_ENV: 'development',
  PORT: 3000,
  INPUT_LIMIT: '1mb'
} as const;
  