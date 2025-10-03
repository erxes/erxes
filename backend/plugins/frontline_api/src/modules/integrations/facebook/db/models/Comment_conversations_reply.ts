import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { commentConversationReplySchema } from '@/integrations/facebook/db/definitions/comment_conversations_reply';
import { IFacebookCommentConversationReplyDocument } from '@/integrations/facebook/@types/comment_conversations_reply';

export interface IFacebookCommentConversationReplyModel
  extends Model<IFacebookCommentConversationReplyDocument> {
  getCommentReply(
    selector: any,
  ): Promise<IFacebookCommentConversationReplyDocument>;
}

export const loadFacebookCommentConversationReplyClass = (models: IModels) => {
  class CommentConversationReply {
    public static async getCommentReply(selector: any) {
      const comment = await models.FacebookCommentConversationReply.findOne(
        selector,
      );

      if (!comment) {
        throw new Error('Comment reply not found');
      }

      return comment;
    }
  }

  commentConversationReplySchema.loadClass(CommentConversationReply);

  return commentConversationReplySchema;
};
