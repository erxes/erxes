import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { commentConversationReplySchema } from '@/integrations/instagram/db/definitions/comment_conversations_reply';
import { IInstagramCommentConversationReplyDocument } from '@/integrations/instagram/@types/comment_conversations_reply';

export interface IInstagramCommentConversationReplyModel extends Model<IInstagramCommentConversationReplyDocument> {
  getCommentReply(
    selector: any,
  ): Promise<IInstagramCommentConversationReplyDocument>;
}

export const loadInstagramCommentConversationReplyClass = (models: IModels) => {
  class CommentConversationReply {
    public static async getCommentReply(selector: any) {
      const comment =
        await models.InstagramCommentConversationReply.findOne(selector);

      if (!comment) {
        throw new Error('Comment reply not found');
      }

      return comment;
    }
  }

  commentConversationReplySchema.loadClass(CommentConversationReply);

  return commentConversationReplySchema;
};
