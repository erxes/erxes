import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { postConversationSchema } from '@/integrations/instagram/db/definitions/postConversations';

import { IInstagramPostConversationDocument } from '@/integrations/instagram/@types/postConversations';

export interface IInstagramPostConversationModel extends Model<IInstagramPostConversationDocument> {
  getConversation(
    selector: any,
    isLean?: boolean,
  ): Promise<IInstagramPostConversationDocument>;
}

export const loadInstagramPostConversationClass = (models: IModels) => {
  class PostConversation {
    public static async getConversation(selector) {
      const conversation =
        await models.InstagramPostConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Post not found');
      }

      return conversation;
    }
  }

  postConversationSchema.loadClass(PostConversation);

  return postConversationSchema;
};
