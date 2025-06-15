import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Opsiyonel ama iyi pratik
import { AppService } from './app.service';
import { Product } from './entities/product.entity';
import { Table } from './entities/table.entity';
import { OrderItem } from './entities/order-item.entity';
import { CompletedOrder } from './entities/completed-order.entity';
import { CompletedOrderItem } from './entities/completed-order-item.entity';
// Oluşturacağın modülleri buraya ekleyeceksin
// import { ProductsModule } from './products/products.module';
// import { TablesModule } from './tables/tables.module';
// import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { TablesModule } from './tables/tables.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './entities/user.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { EventsGateway } from './events/events.gateway';


@Module({
  imports: [
    ConfigModule.forRoot({ // Ortam değişkenleri için (opsiyonel)
      isGlobal: true,
      expandVariables:true
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite', // Veritabanı türü
      database: 'pos-database.sqlite', // Veritabanı dosyasının adı/yolu
      // --- Entity'lerini buraya ekleyeceksin ---
      entities: [
       Product,Table,OrderItem,CompletedOrder,CompletedOrderItem,User
      ],
      // DİKKAT: 'synchronize: true' sadece geliştirme ortamında kullanılmalıdır.
      // Production'da migration kullanmalısın. Değişikliklerde veritabanını otomatik günceller.
      synchronize: true, // Geliştirme için kolaylık sağlar
      logging: true, // SQL sorgularını konsolda görmek için (geliştirme)
    }),
    ProductsModule,
    TablesModule,
    OrdersModule,
    UserModule,
    AuthModule,
    
    
    // --- Diğer Modüller ---
    // ProductsModule,
    // TablesModule,
    // OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService,EventsGateway],
})
export class AppModule {}