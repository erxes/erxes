import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  postConversationSchema,
  IPostConversationDocument,
} from './definitions/postConversations';

export interface IPostConversationModel
  extends Model<IPostConversationDocument> {
  getConversation(
    selector: any,
    isLean?: boolean,
  ): Promise<IPostConversationDocument>;
}

export const loadPostConversationClass = (models: IModels) => {
  class PostConversation {
    public static async getConversation(selector) {
      const conversation = await models.PostConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Post not found');
      }

      return conversation;
    }
  }

  postConversationSchema.loadClass(PostConversation);

  return postConversationSchema;
};
