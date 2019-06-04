import { Document, Model, Schema } from 'mongoose';
import { apiConnection } from '../connection';

export interface IConversation {
  createdAt: Date;
  content: string;
  status: string;
  customerId: string;
  messageCount: number;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  createdAt: Date,
  content: String,
  status: String,
  customerId: String,
  messageCount: Number,
});

export interface IConversationModel extends Model<IConversationDocument> {}

// tslint:disable-next-line
const Conversations = apiConnection.model<IConversationDocument, IConversationModel>(
  'conversations',
  conversationSchema,
);

export default Conversations;
