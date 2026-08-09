import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationMessageSchema } from '@/integrations/whatsapp/db/definitions/conversationMessages';
import {
  IWhatsappConversationMessage,
  IWhatsappConversationMessageDocument,
} from '@/integrations/whatsapp/@types';

export interface IWhatsappConversationMessageModel
  extends Model<IWhatsappConversationMessageDocument> {
  getMessage(
    selector: FilterQuery<IWhatsappConversationMessageDocument>,
  ): Promise<IWhatsappConversationMessageDocument>;
  addMessage(
    doc: IWhatsappConversationMessage,
  ): Promise<IWhatsappConversationMessageDocument>;
}

/** Builds the WhatsApp message model class bound to this tenant's models. */
export const loadWhatsappConversationMessageClass = (models: IModels) => {
  /** One message in a WhatsApp thread, in either direction. */
  class ConversationMessage {
    /** Finds one message, throwing when there is none. */
    public static async getMessage(
      selector: FilterQuery<IWhatsappConversationMessageDocument>,
    ) {
      const message = await models.WhatsappConversationMessages.findOne(
        selector,
      );

      if (!message) {
        throw new Error('Conversation message not found');
      }

      return message;
    }

    /**
     * Insert a message, tolerating Meta re-delivering the same webhook.
     *
     * Meta gives no at-most-once guarantee, so the same `wamid` can arrive more
     * than once. `mid` is uniquely indexed; on a duplicate we return the
     * existing row instead of throwing, so a retried webhook is a no-op rather
     * than a 500 that makes Meta retry again.
     */
    public static async addMessage(doc: IWhatsappConversationMessage) {
      try {
        return await models.WhatsappConversationMessages.create(doc);
      } catch (e) {
        // 11000 is Mongo's duplicate-key code and the reliable signal. The
        // string match is only a fallback: it depends on the driver's wording
        // and casing, so on its own it would let a genuine duplicate rethrow
        // as a 500 and make Meta retry the whole batch.
        if (e.code === 11000 || e.message?.includes('duplicate')) {
          return await models.WhatsappConversationMessages.getMessage({
            mid: doc.mid,
          });
        }

        throw e;
      }
    }
  }

  conversationMessageSchema.loadClass(ConversationMessage);

  return conversationMessageSchema;
};
