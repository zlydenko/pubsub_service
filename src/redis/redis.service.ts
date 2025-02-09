import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as msgpack from '@msgpack/msgpack';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisPub: Redis.Redis;
  private redisSub: Redis.Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');

    const redisOptions = {
      host: redisHost,
      port: redisPort,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      commandTimeout: 30000,
      reconnectOnError: (err: Error) => {
        this.logger.error('Redis reconnect error:', err);
        return true;
      },
      retryStrategy: (times: number) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
      connectTimeout: 30000,
      lazyConnect: false,
      keepAlive: 30000,
      db: 0,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
      retryUnfulfilled: true
    };

    this.redisPub = new Redis.Redis(redisOptions);
    this.redisSub = new Redis.Redis(redisOptions);
  }

  async onModuleInit() {
    this.redisPub.on('error', (err) => this.logger.error('Redis pub error:', err));
    this.redisSub.on('error', (err) => this.logger.error('Redis sub error:', err));
  }

  async onModuleDestroy() {
    await Promise.all([this.redisPub.quit(), this.redisSub.quit()]);
  }

  async publish(channel: string, data: any): Promise<void> {
    try {
      const encoded = msgpack.encode(data);
      const packedBase64 = Buffer.from(encoded).toString('base64');
      await this.redisPub.publish(channel, packedBase64);
    } catch (error) {
      this.logger.error(`Redis publish error: ${(error as Error)?.message || "Unknown error"}`);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (data: any) => void): Promise<void> {
    try {
      this.redisSub.on('message', (ch, message) => {
        if (ch === channel) {
          try {
            const decoded = msgpack.decode(Buffer.from(message, 'base64'));
            callback(decoded);
          } catch (error) {
            this.logger.error(`Redis message decode error: ${(error as Error)?.message || "Unknown error"}`);
          }
        }
      });
      await this.redisSub.subscribe(channel);
    } catch (error) {
      this.logger.error(`Redis subscribe error: ${(error as Error)?.message || "Unknown error"}`);
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.redisSub.unsubscribe(channel);
    } catch (error) {
      this.logger.error(`Redis unsubscribe error: ${(error as Error)?.message || "Unknown error"}`);
      throw error;
    }
  }

  getRedisSub(): Redis.Redis {
    return this.redisSub;
  }
} 