import * as Random from 'meteor-random';
import { Document, Model, Schema } from 'mongoose';
import { apiConnection } from '../connection';

export interface IConversation {
  createdAt: Date;
  updatedAt: Date;
  content: string;
  status: string;
  customerId: string;
  integrationId: string;
  messageCount: number;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: { type: String, default: () => Random.id() },
  createdAt: Date,
  updatedAt: Date,
  content: String,
  status: String,
  customerId: String,
  integrationId: String,
  messageCount: Number,
});

export interface IConversationModel extends Model<IConversationDocument> {}

// tslint:disable-next-line
const Conversations = apiConnection.model<IConversationDocument, IConversationModel>(
  'conversations',
  conversationSchema,
);

export default Conversations;
