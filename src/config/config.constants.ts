export interface IConfig {
  REDIS_HOST: string;
  REDIS_PORT: number;
  NODE_ENV?: string;
  PORT: number;
}

export const DEFAULT_CONFIG: Partial<IConfig> = {
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  NODE_ENV: 'development',
  PORT: 3000
};
  