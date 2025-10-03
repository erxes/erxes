import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { commentConversationSchema } from '@/integrations/facebook/db/definitions/comment_conversations';
import { IFacebookCommentConversationReplyDocument } from '@/integrations/facebook/@types/comment_conversations_reply';
export interface IFacebookCommentConversationModel
  extends Model<IFacebookCommentConversationReplyDocument> {
  getCommentConversation(
    selector: any,
  ): Promise<IFacebookCommentConversationReplyDocument>;
}

export const loadFacebookCommentConversationClass = (models: IModels) => {
  class CommentConversation {
    public static async getCommentConversation(selector: any) {
      const comment = await models.FacebookCommentConversation.findOne(
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
