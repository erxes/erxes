import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  commentConversationSchema,
  ICommentConversationDocument,
} from './definitions/comment_conversations';

export interface ICommentConversationModel
  extends Model<ICommentConversationDocument> {
  getCommentConversation(selector: any): Promise<ICommentConversationDocument>;
}

export const loadCommentConversationClass = (models: IModels) => {
  class CommentConversation {
    public static async getCommentConversation(selector: any) {
      const comment = await models.CommentConversation.findOne(selector);

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }
  }

  commentConversationSchema.loadClass(CommentConversation);

  return commentConversationSchema;
};
