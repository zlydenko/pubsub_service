import { Module } from '@nestjs/common';
import { PubSubController } from './pubsub.controller';
import { PubSubService } from './pubsub.service';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [PubSubService],
    controllers: [PubSubController],
    exports: []
})
export class PubSubModule {}