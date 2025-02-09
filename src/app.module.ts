import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { PubSubModule } from './pubsub';

@Module({
    imports: [
        ConfigModule,
        PubSubModule
    ],
    providers: [],
    exports: [],
})
export class AppModule {}