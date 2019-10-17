import { Document, Model, model, Schema } from 'mongoose';
import { field } from '../models/utils';

// customer ======================
export interface ICustomer {
  chatfuelUserId: string;
  integrationId: string;
  // id on erxes-api
  erxesApiId?: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  chatfuelUserId: { type: String, unique: true },
  integrationId: String,
  erxesApiId: String,
});

export interface ICustomerModel extends Model<ICustomerDocument> {}

// conversation ===========================
export interface IConversation {
  // id on erxes-api
  erxesApiId?: string;
  timestamp: Date;
  chatfuelUserId: string;
  integrationId: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  timestamp: Date,
  integrationId: String,
  chatfuelUserId: { type: String, index: true },
});

export interface IConversationModel extends Model<IConversationDocument> {}

// conversation message ===========================
export interface IConversationMessage {
  content: string;
  conversationId: string;
}

export interface IConversationMessageDocument extends IConversationMessage, Document {}

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  content: String,
  conversationId: String,
});

export interface IConversationMessageModel extends Model<IConversationMessageDocument> {}

// tslint:disable-next-line
export const Customers = model<ICustomerDocument, ICustomerModel>('customers_chatfuel', customerSchema);

// tslint:disable-next-line
export const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations_chatfuel',
  conversationSchema,
);

// tslint:disable-next-line
export const ConversationMessages = model<IConversationMessageDocument, IConversationMessageModel>(
  'conversation_messages_chatfuel',
  conversationMessageSchema,
);
