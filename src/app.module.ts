import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsController } from './posts/posts.controller';
import { UserPostService } from './posts/posts.service';
import {
  UserPost,
  PostSchema as UserPostSchema,
} from './schemas/userPost.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/post-comment'),

    // TODO: see Post.name works
    MongooseModule.forFeature([
      { name: UserPost.name, schema: UserPostSchema },
    ]),

    // TODO: see how factory works
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async () => ({
    //     uri: 'mongodb://localhost:27017',
    //     // useNewUrlParser: true,
    //     // useUnifiedTopology: true,
    //     // useCreateIndex: true,
    //     // useFindAndModify: false,
    //   }),
    // }),

    // TODO: inject to factory provider
    //   inject: [getConnectionToken('cats')],
  ],
  controllers: [AppController, PostsController],
  providers: [AppService, UserPostService],
})
export class AppModule {}
