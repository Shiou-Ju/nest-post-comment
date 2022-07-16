// Node modules
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// Local Modules
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsController } from './userPosts/userPosts.controller';
import { UserPostService } from './userPosts/userPosts.service';
import {
  UserPost,
  PostSchema as UserPostSchema,
} from './schemas/userPost.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    // MongooseModule.forRoot('mongodb://localhost/post-comment'),
    // TODO: inject config service at root level
    MongooseModule.forRoot(process.env.MONGO_URI),

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
