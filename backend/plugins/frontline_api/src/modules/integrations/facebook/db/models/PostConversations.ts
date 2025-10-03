import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { postConversationSchema } from '@/integrations/facebook/db/definitions/postConversations';
import { IFacebookPostConversationDocument } from '@/integrations/facebook/@types/postConversations';
export interface IFacebookPostConversationModel
  extends Model<IFacebookPostConversationDocument> {
  getConversation(
    selector: any,
    isLean?: boolean,
  ): Promise<IFacebookPostConversationDocument>;
}

export const loadFacebookPostConversationClass = (models: IModels) => {
  class PostConversation {
    public static async getConversation(selector) {
      const conversation = await models.FacebookPostConversations.findOne(
        selector,
      );

      if (!conversation) {
        throw new Error('Post not found');
      }

      return conversation;
    }
  }

  postConversationSchema.loadClass(PostConversation);

  return postConversationSchema;
};
