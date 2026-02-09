import { Document, Model, Schema } from "mongoose";
import { field } from "../models/utils";

// customer ======================
export interface ICustomer {
  phoneNumber: string;
  integrationId: string;
  // id on erxes-api
  erxesApiId?: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  phoneNumber: { type: String, unique: true },
  integrationId: String,
  erxesApiId: String,
});

export interface ICustomerModel extends Model<ICustomerDocument> {}

export interface ICallProLog {
  type: string;
  value: any;
  specialValue: any;
  createdAt: Date;
}

export interface ICallProLogDocument extends ICallProLog, Document {}

export const callProLogSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  value: field({ type: Object }),
  specialValue: field({ type: String }),
  createdAt: field({ type: Date }),
});

export interface ICallProLogModel extends Model<ICallProLogDocument> {}

// conversation ===========================
export interface IConversation {
  // id on erxes-api
  erxesApiId?: string;
  senderPhoneNumber: string;
  recipientPhoneNumber: string;
  state: string;
  integrationId: string;
  callId: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  state: String,
  integrationId: String,
  senderPhoneNumber: { type: String, index: true },
  recipientPhoneNumber: { type: String, index: true },
  callId: { type: String, unique: true },
});

export interface IConversationModel extends Model<IConversationDocument> {}

// // tslint:disable-next-line
// export const Customers = model<ICustomerDocument, ICustomerModel>(
//   'customers_callpro',
//   customerSchema
// );

// // tslint:disable-next-line
// export const Conversations = model<IConversationDocument, IConversationModel>(
//   'conversations_callpro',
//   conversationSchema
// );
