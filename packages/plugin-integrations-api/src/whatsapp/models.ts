import { Document, Model, model, Schema } from 'mongoose';
import { field } from '../models/utils';

export interface ICustomer {
  phoneNumber: string;
  erxesApiId?: string;
  name: string;
  integrationId: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  phoneNumber: { type: String, unique: true },
  erxesApiId: String,
  name: String,
  integrationId: String
});

export interface ICustomerModel extends Model<ICustomerDocument> {
  getCustomer(selector: any, isLean?: boolean): Promise<ICustomerDocument>;
}

export const loadCustomerClass = () => {
  class Customer {
    public static async getCustomer(selector: any, isLean: boolean) {
      const customer = isLean
        ? await Customers.findOne(selector).lean()
        : await Customers.findOne(selector);

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};

// conversation ===========================

export interface IConversation {
  // id on erxes-api
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  instanceId: string;
  content: string;
  integrationId: string;
  recipientId: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  timestamp: Date,
  senderId: String,
  instanceId: String,
  content: String,
  integrationId: String,
  recipientId: String
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

// conversation message ===========================
export interface IConversationMessage {
  mid: string;
  conversationId: string;
  content: string;
  status: string;
}

export interface IConversationMessageDocument
  extends IConversationMessage,
    Document {}

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  mid: { type: String, unique: true },
  conversationId: String,
  content: String,
  status: String
});

export interface IConversationMessageModel
  extends Model<IConversationMessageDocument> {}

loadCustomerClass();

loadConversationClass();

// tslint:disable-next-line:variable-name
export const Customers = model<ICustomerDocument, ICustomerModel>(
  'customers_whatsapp',
  customerSchema
);

// tslint:disable-next-line:variable-name
export const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations_whatsapp',
  conversationSchema
);

// tslint:disable-next-line:variable-name
export const ConversationMessages = model<
  IConversationMessageDocument,
  IConversationMessageModel
>('conversation_messages_whatsapp', conversationMessageSchema);
