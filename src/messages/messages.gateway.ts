import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessagesGateway implements OnModuleInit {
  constructor(private readonly messagesService: MessagesService) {}

  @WebSocketServer()
  socket: Socket;

  onModuleInit() {
    this.socket.on('connection', (socket) => {
      console.log('Socket connected: ', socket.id);
    });
  }

  @SubscribeMessage('createMessage')
  create(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = this.messagesService.create(createMessageDto);
    this.socket.emit('message', message);

    return message;
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('join')
  join(@MessageBody('name') name: string, @ConnectedSocket() client: Socket) {
    return this.messagesService.identify(name, client.id);
  }

  @SubscribeMessage('typing')
  typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const name = this.messagesService.getClientName(client.id);
    client.broadcast.emit('typing', { name, isTyping });
  }
}
