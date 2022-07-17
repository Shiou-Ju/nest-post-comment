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
import { CommentsController } from './comments/comments.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    // TODO: inject config service at root level
    MongooseModule.forRoot(process.env.MONGO_URI),

    // TODO: see Post.name works
    MongooseModule.forFeature([
      { name: UserPost.name, schema: UserPostSchema },
    ]),
  ],
  controllers: [AppController, PostsController, CommentsController],
  providers: [AppService, UserPostService],
})
export class AppModule {}
