import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as msgpack from '@msgpack/msgpack';
import * as Redis from 'ioredis';
import { on, Readable } from 'stream';

import { RedisService } from '../redis';

@Injectable()
export class PubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);
  private readonly callbacks = new Map<string, (message: any) => void>();

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    this.logger.log('PubSubService initialized');
  }

  async onModuleDestroy() {
    this.logger.log('PubSubService destroyed');
  }

  async publish(topic: string, data: any): Promise<void> {
    try {
      await this.redisService.publish(topic, data);
      this.logger.log(`Published message to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Error publishing message to topic ${topic}:`, error);
      throw error;
    }
  }

  async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    try {
      this.callbacks.set(topic, callback);
      await this.redisService.subscribe(topic, callback);
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  async unsubscribe(topic: string): Promise<void> {
    try {
      await this.redisService.unsubscribe(topic);
      this.callbacks.delete(topic);
      this.logger.log(`Unsubscribed from topic ${topic}`);
    } catch (error) {
      this.logger.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

  getWriteStream(topic: string): Readable {
    this.logger.log(`Getting write stream for topic ${topic}`);

    async function* messageStream(redisSub: Redis.Redis) {
      for await (const [channel, message] of on(redisSub, 'message')) {
        if (channel === topic) yield msgpack.decode(Buffer.from(message, 'base64'));
      }
    }

    return Readable.from(messageStream(this.redisService.getRedisSub()), { highWaterMark: 128 * 1024 });
  }
}