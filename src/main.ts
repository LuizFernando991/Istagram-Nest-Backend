import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, //Ignore data that's out from dto
      forbidNonWhitelisted: true
    })
  )

  await app.listen(process.env.PORT || 3000)
}
bootstrap()
