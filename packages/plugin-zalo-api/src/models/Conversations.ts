import { Model, Document, Schema, HydratedDocument } from 'mongoose';
import { IModels } from '.';
import { field } from './definitions/utils';

export interface IConversation {
  // id on erxes-api
  _id :string;
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  conversationId: string;
  zaloConversationId: string;
}

export type IConversationDocument = HydratedDocument<IConversation>;

export const conversationSchema = new Schema<IConversation>({
  _id: field({ pkey: true }),
  erxesApiId: String,
  timestamp: Date,
  senderId: { type: String, index: true },
  recipientId: { type: String, index: true },
  integrationId: String,
  content: String,
  conversationId: String,
  zaloConversationId: String
});

conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });

export interface IConversationModel extends Model<IConversation> {
  getConversation(selector): Promise<IConversationDocument>;
}

export const loadConversationClass = (models: IModels) => {
  class Conversation {
    public static async getConversation(selector) {
      const conversation = await models.Conversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
