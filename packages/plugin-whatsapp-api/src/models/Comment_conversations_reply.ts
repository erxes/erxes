import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  commentConversationReplySchema,
  ICommentConversationReplyDocument,
} from './definitions/comment_conversations_reply';

export interface ICommentConversationReplyModel
  extends Model<ICommentConversationReplyDocument> {
  getCommentReply(selector: any): Promise<ICommentConversationReplyDocument>;
}

export const loadCommentConversationReplyClass = (models: IModels) => {
  class CommentConversationReply {
    public static async getCommentReply(selector: any) {
      const comment = await models.CommentConversationReply.findOne(selector);

      if (!comment) {
        throw new Error('Comment reply not found');
      }

      return comment;
    }
  }

  commentConversationReplySchema.loadClass(CommentConversationReply);

  return commentConversationReplySchema;
};
