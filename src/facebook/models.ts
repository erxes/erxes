import { Document, Model, model, Schema } from 'mongoose';

// customer ======================
export interface ICustomer {
  userId: string;
  // id on erxes-api
  erxesApiId?: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  userId: String,
  erxesApiId: String,
  firstName: String,
  lastName: String,
  profilePic: String,
});

export interface ICustomerModel extends Model<ICustomerDocument> {}

// conversation ===========================
export interface IConversation {
  // id on erxes-api
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  erxesApiId: String,
  timestamp: Date,
  senderId: String,
  recipientId: String,
  content: String,
});

export interface IConversationModel extends Model<IConversationDocument> {}

// tslint:disable-next-line
export const Customers = model<ICustomerDocument, ICustomerModel>('customers_facebook', customerSchema);

// tslint:disable-next-line
export const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations_facebook',
  conversationSchema,
);
