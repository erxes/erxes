import { Document, Model, Schema } from 'mongoose';
import { apiConnection } from '../connection';

export interface IConversationMessage {
  createdAt: Date;
  content: string;
  conversationId: string;
  customerId: string;
  internal: boolean;
}

export interface IConversationMessageDocument extends IConversationMessage, Document {}

export const conversationMessageSchema = new Schema({
  createdAt: Date,
  content: String,
  conversationId: String,
  customerId: String,
  internal: Boolean,
});

export interface IConversationMessageModel extends Model<IConversationMessageDocument> {}

// tslint:disable-next-line
const ConversationMessages = apiConnection.model<IConversationMessageDocument, IConversationMessageModel>(
  'conversation_messages',
  conversationMessageSchema,
);

export default ConversationMessages;
