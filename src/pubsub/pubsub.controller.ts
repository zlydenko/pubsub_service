import { Controller, Post, Param, Res, Sse, MessageEvent, Body } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { Observable, Subject } from 'rxjs';

import { PubSubService } from './pubsub.service';
import { PublishMessageDto, PublishResponseDto } from './dto';

@ApiTags('pubsub')
@Controller('topics')
export class PubSubController {
  private readonly logger = new Logger(PubSubController.name);

  constructor(private readonly pubSubService: PubSubService) {}

  @Post(':topic')
  @ApiOperation({ summary: 'Publish message to a topic' })
  @ApiParam({ name: 'topic', description: 'Topic name' })
  @ApiBody({ type: PublishMessageDto })
  @ApiResponse({ status: 200, type: PublishResponseDto })
  @ApiResponse({ status: 500, description: 'Server error' })
  async publish(
    @Param('topic') topic: string, 
    @Res() response: Response,
    @Body() body: PublishMessageDto
  ) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      await Promise.race([
        this.pubSubService.publish(topic, body.data),
        timeoutPromise
      ]);

      return response.status(200).json({ message: 'Message received' });
    } catch (error: any) {
      this.logger.error(`Publish error: ${(error as Error).message}`);
      return response.status(500).json({ error: 'Failed to publish message' });
    }
  }

  @Sse(':topic')
  @ApiOperation({ summary: 'Subscribe to a topic' })
  @ApiParam({ name: 'topic', description: 'Topic name' })
  @ApiResponse({ status: 200, description: 'SSE connection established' })
  subscribe(@Param('topic') topic: string, @Res() response: Response): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    this.pubSubService.subscribe(topic, (data) => {
      subject.next({ data });
    });

    response.on('close', () => {
      this.pubSubService.unsubscribe(topic);
      subject.complete();
    });

    return subject.asObservable();
  }
}
