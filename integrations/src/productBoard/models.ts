import { Document, Model, model, Schema } from 'mongoose';
import { field } from '../models/utils';

export interface IConversation {
  erxesApiId?: string;
  timestamp: Date;
  productBoardLink?: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  timestamp: Date,
  productBoardLink: String
});

// conversationSchema.index({ instanceId: 1, recipientId: 1 }, { unique: true });

export interface IConversationModel extends Model<IConversationDocument> {
  getConversation(selector): Promise<IConversationDocument>;
}

export const loadConversationClass = () => {
  class Conversation {
    public static async getConversation(selector) {
      const conversation = await Conversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};

// tslint:disable-next-line:variable-name
export const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations_productboard',
  conversationSchema
);
