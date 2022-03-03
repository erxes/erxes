import { Document, model, Model, Schema } from 'mongoose';
import { field } from '../models/utils';

export interface ISmoochCustomer {
  surname?: string;
  givenName?: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  smoochUserId: string;
  erxesApiId: string;
  integrationId: string;
  kind: string;
}

export interface ISmoochCustomerDocument extends ISmoochCustomer, Document {}
export interface ISmoochCustomerModel extends Model<ISmoochCustomerDocument> {}

// Customer =============
const customerCommonSchema = {
  _id: field({ pkey: true }),
  surname: { type: String, optional: true },
  givenName: { type: String, optional: true },
  avatarUrl: { type: String, optional: true },
  phone: { type: String, optional: true },
  email: { type: String, optional: true },
  smoochUserId: { type: String, unique: true },
  integrationId: String,
  erxesApiId: String,
  kind: String
};

export const smoochTelegramCustomerSchema = new Schema(customerCommonSchema);

// tslint:disable-next-line
export const SmoochTelegramCustomers = model<
  ISmoochCustomerDocument,
  ISmoochCustomerModel
>('customers_smooch_telegram', smoochTelegramCustomerSchema);

export const smoochViberCustomerSchema = new Schema(customerCommonSchema);

// tslint:disable-next-line
export const SmoochViberCustomers = model<
  ISmoochCustomerDocument,
  ISmoochCustomerModel
>('customers_smooch_viber', smoochViberCustomerSchema);

export const smoochLineCustomerSchema = new Schema(customerCommonSchema);

// tslint:disable-next-line
export const SmoochLineCustomers = model<
  ISmoochCustomerDocument,
  ISmoochCustomerModel
>('customers_smooch_line', smoochLineCustomerSchema);

export const smoochTwilioCustomerSchema = new Schema(customerCommonSchema);

// tslint:disable-next-line
export const SmoochTwilioCustomers = model<
  ISmoochCustomerDocument,
  ISmoochCustomerModel
>('customers_smooch_twilio_sms', smoochTwilioCustomerSchema);

export interface ISmoochConversation {
  smoochConversationId: string;
  content: string;
  customerId: string;
  erxesApiId: string;
  createdAt: Date;
  integrationId: string;
  kind: string;
}

export interface ISmoochConversationDocument
  extends ISmoochConversation,
    Document {}

// Conversation ==========
const conversationCommonSchema = {
  _id: field({ pkey: true }),
  smoochConversationId: { type: String, index: true },
  content: String,
  customerId: String,
  erxesApiId: String,
  integrationId: String,
  createdAt: field({ type: Date, index: true, default: new Date() }),
  kind: String
};
export interface ISmoochConversatonModel
  extends Model<ISmoochConversationDocument> {}

export const smoochTelegramConversationSchema = new Schema(
  conversationCommonSchema
);

// tslint:disable-next-line:variable-name
export const SmoochTelegramConversations = model<
  ISmoochConversationDocument,
  ISmoochConversatonModel
>('conversations_smooch_telegram', smoochTelegramConversationSchema);

export const smoochViberConversationSchema = new Schema(
  conversationCommonSchema
);

// tslint:disable-next-line:variable-name
export const SmoochViberConversations = model<
  ISmoochConversationDocument,
  ISmoochConversatonModel
>('conversations_smooch_viber', smoochViberConversationSchema);

export const smoochLineConversationSchema = new Schema(
  conversationCommonSchema
);

// tslint:disable-next-line:variable-name
export const SmoochLineConversations = model<
  ISmoochConversationDocument,
  ISmoochConversatonModel
>('conversations_smooch_line', smoochLineConversationSchema);

export const smoochTwilioConversationSchema = new Schema(
  conversationCommonSchema
);

// tslint:disable-next-line:variable-name
export const SmoochTwilioConversations = model<
  ISmoochConversationDocument,
  ISmoochConversatonModel
>('conversations_smooch_twilio_sms', smoochTwilioConversationSchema);

// Conversation message ===========

export interface ISmoochConversationMessage {
  messageId: string;
  conversationId: string;
  content: string;
  authorId: string;
}

export interface ISmoochConversationMessageDocument
  extends ISmoochConversationMessage,
    Document {}

const conversationMessageCommonSchema = {
  _id: field({ pkey: true }),
  messageId: String,
  conversationId: String,
  content: String,
  authorId: String
};

export interface ISmoochConversationMessageModel
  extends Model<ISmoochConversationMessageDocument> {}

export const smoochTelegramConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);

// tslint:disable-next-line
export const SmoochTelegramConversationMessages = model<
  ISmoochConversationMessageDocument,
  ISmoochConversationMessageModel
>(
  'conversation_messages_smooch_telegram',
  smoochTelegramConversationMessageSchema
);

export const smoochViberConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);

// tslint:disable-next-line
export const SmoochViberConversationMessages = model<
  ISmoochConversationMessageDocument,
  ISmoochConversationMessageModel
>('conversation_messages_smooch_viber', smoochViberConversationMessageSchema);

export const smoochLineConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);

// tslint:disable-next-line
export const SmoochLineConversationMessages = model<
  ISmoochConversationMessageDocument,
  ISmoochConversationMessageModel
>('conversation_messages_smooch_line', smoochLineConversationMessageSchema);

export const smoochTwilioConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);

// tslint:disable-next-line
export const SmoochTwilioConversationMessages = model<
  ISmoochConversationMessageDocument,
  ISmoochConversationMessageModel
>(
  'conversation_messages_smooch_twilio_sms',
  smoochTwilioConversationMessageSchema
);
