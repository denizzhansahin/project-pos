// src/events/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// CORS ayarları önemli! Frontend adresine izin ver.
// Portu backend portundan farklı seçmek iyi olabilir ama zorunlu değil.
// Eğer aynı portu kullanacaksanız, HTTP server ile entegrasyonu doğru yapılmalı.
// Ayrı port daha basit olabilir: örn. 3002
@WebSocketGateway({
   // port: 3002, // Opsiyonel ayrı port
   cors: {
     origin: ['http://localhost:5173', 'http://pardus-nirvana-nb-s500-silver.local:5173','http://localhost:4173', 'http://pardus-nirvana-nb-s500-silver.local:4173'], // Frontend adresleriniz
     methods: ['GET', 'POST'],
     credentials: true,
   },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // Socket.IO sunucu instance'ını enjekte et
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    // İsteğe bağlı: Bağlanan kullanıcıyı doğrula (JWT kullanarak)
    // const token = client.handshake.auth.token; // Frontend'den gönderilen token
    // try {
    //   const payload = this.jwtService.verify(token);
    //   client.data.user = payload; // Kullanıcı bilgisini sokete ekle
    //   this.logger.log(`Client authenticated: ${client.id} - User: ${payload.email}`);
    // } catch (e) {
    //   this.logger.error(`Authentication failed for client ${client.id}`, e.message);
    //   client.disconnect(true);
    // }

     // Tüm bağlı istemcilere güncel masa listesini gönderebiliriz (opsiyonel)
     // this.emitTableListUpdate(); // Bu fonksiyonu tanımlamamız lazım
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // --- Olay Yayınlama Metotları (Servisler tarafından çağrılacak) ---

  // Tüm istemcilere genel bir mesaj gönderme örneği
  broadcast(event: string, payload: any) {
     this.logger.log(`Broadcasting event: ${event}`);
     this.server.emit(event, payload);
  }

  // Belirli bir odaya mesaj gönderme (örn: sadece belirli bir masayı izleyenler)
  emitToRoom(room: string, event: string, payload: any) {
      this.logger.log(`Emitting event to room ${room}: ${event}`);
      this.server.to(room).emit(event, payload);
  }


  // --- İstemciden Gelen Mesajları Dinleme (Opsiyonel) ---
  // Örnek: İstemci bir masayı izlemeye başladığında odaya katılması
  @SubscribeMessage('joinTableRoom')
  handleJoinRoom(
      @MessageBody() tableId: string,
      @ConnectedSocket() client: Socket,
  ): void {
      if (tableId) {
          const roomName = `table-${tableId}`;
          client.join(roomName);
          this.logger.log(`Client ${client.id} joined room: ${roomName}`);
          // Odaya katılan istemciye o anki masa durumunu gönderebiliriz
          // this.emitSpecificTableUpdate(tableId, client.id); // Bu fonksiyonu tanımlamamız lazım
      }
  }

  @SubscribeMessage('leaveTableRoom')
  handleLeaveRoom(
       @MessageBody() tableId: string,
       @ConnectedSocket() client: Socket,
  ): void {
       if (tableId) {
            const roomName = `table-${tableId}`;
            client.leave(roomName);
            this.logger.log(`Client ${client.id} left room: ${roomName}`);
       }
  }

  // Diğer @SubscribeMessage'lar eklenebilir...

}