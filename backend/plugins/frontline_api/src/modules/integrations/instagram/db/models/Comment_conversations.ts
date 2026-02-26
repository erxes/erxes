import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { commentConversationSchema } from '../definitions/comment_conversations';
import { IInstagramCommentConversationDocument } from '@/integrations/instagram/@types/comment_conversations';

export interface IInstagramCommentConversationModel
  extends Model<IInstagramCommentConversationDocument> {
  getCommentConversation(
    selector: any,
  ): Promise<IInstagramCommentConversationDocument>;
}

export const loadInstagramCommentConversationClass = (models: IModels) => {
  class CommentConversation {
    public static async getCommentConversation(selector: any) {
      const comment = await models.InstagramCommentConversation.findOne(
        selector,
      );

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }
  }

  commentConversationSchema.loadClass(CommentConversation);

  return commentConversationSchema;
};
