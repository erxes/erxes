import { Document, Model, model, Schema } from 'mongoose';
import { field } from '../models/utils';
import { IMailParams } from './types';

export interface ICustomer {
  email: string;
  firstName?: string;
  lastName?: string;
  erxesApiId?: string;
  integrationId?: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  email: { type: String, unique: true },
  erxesApiId: String,
  firstName: String,
  lastName: String,
  integrationId: String,
});

export interface ICustomerModel extends Model<ICustomerDocument> {}

// tslint:disable-next-line
export const Customers = model<ICustomerDocument, ICustomerModel>('customers_gmail', customerSchema);

export interface IConversation {
  to: string;
  from: string;
  threadId: string;
  content: string;
  customerId: string;
  erxesApiId: string;
  createdAt: Date;
  integrationId: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  to: { type: String, index: true },
  from: { type: String, index: true },
  threadId: { type: String, index: true },
  content: String,
  customerId: String,
  erxesApiId: String,
  integrationId: String,
  createdAt: field({ type: Date, index: true, default: new Date() }),
});

export interface IConversatonModel extends Model<IConversationDocument> {}

// tslint:disable-next-line
export const Conversations = model<IConversationDocument, IConversatonModel>('conversations_gmail', conversationSchema);

export interface IConversationMessage extends IMailParams {
  conversationId: string;
  erxesApiMessageId: string;
  createdAt: Date;
}

export interface IConversationMessageDocument extends IConversationMessage, Document {}

export const attachmentSchema = new Schema({
  _id: field({ pkey: true }),
  filename: String,
  mimeType: String,
  size: Number,
  attachmentId: String,
});

const emailSchema = {
  _id: false,
  name: String,
  email: String,
};

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  conversationId: String,
  erxesApiMessageId: String,
  messageId: { type: String, unique: true },
  threadId: String,
  subject: String,
  body: String,
  to: [emailSchema],
  cc: [emailSchema],
  bcc: [emailSchema],
  from: [emailSchema],
  references: String,
  headerId: String,
  labelIds: [String],
  reply: [String],
  attachments: [attachmentSchema],
  createdAt: field({ type: Date, index: true, default: new Date() }),
});

export interface IConversatonMessageModel extends Model<IConversationMessageDocument> {}

// tslint:disable-next-line
export const ConversationMessages = model<IConversationMessageDocument, IConversatonMessageModel>(
  'conversation_messages_gmail',
  conversationMessageSchema,
);
