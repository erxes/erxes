import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { callProConversationSchema } from '@/integrations/callpro/db/definitions/conversations';
import { ICallProConversationDocument } from '@/integrations/callpro/@types/conversations';

export interface ICallProConversationModel
  extends Model<ICallProConversationDocument> {
  getConversation(
    selector: FilterQuery<ICallProConversationDocument>,
  ): Promise<ICallProConversationDocument>;
}

export const loadCallProConversationClass = (models: IModels) => {
  // skipcq: JS-0327
  class Conversation {
    public static async getConversation(
      selector: FilterQuery<ICallProConversationDocument>,
    ) {
      const conversation = await models.CallProConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  callProConversationSchema.loadClass(Conversation);

  return callProConversationSchema;
};
