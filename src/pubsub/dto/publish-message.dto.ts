import { ApiProperty } from '@nestjs/swagger';

export class PublishMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: { 
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello World"
    }
  })
  readonly data: any;
}

export class PublishResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: {
      "message": "Message received"
    }
  })
  readonly message: string;
} 