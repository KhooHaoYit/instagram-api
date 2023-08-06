import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'nestjs-prisma';
import { AuthModule } from './auth/module';
import { SharedSecretAuthGuard } from './auth/sharedSecret.strategy';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SharedSecretAuthGuard,
    },
  ],
})
export class AppModule { }
