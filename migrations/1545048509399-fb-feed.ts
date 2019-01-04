import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { ConversationMessages } from '../src/db/models';

dotenv.config();

/**
 * Updating every post and parent comment's commentCount to 101 by static
 *
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    async () => {
      await ConversationMessages.updateMany({ 'facebookData.isPost': true }, { 'facebookData.commentCount': 101 });

      await ConversationMessages.updateMany(
        {
          $and: [{ 'facebookData.commentId': { $exists: true } }, { 'facebookData.parentId': { $exists: false } }],
        },
        { 'facebookData.commentCount': 101 },
      );

      next();
    },
  );
};
