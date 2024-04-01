import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IConversation {
  // id on erxes-api
  erxesApiId?: string;
  callerNumber: string;
  operatorPhone: string;
  integrationId: string;
  callId: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  integrationId: String,
  callerNumber: { type: String },
  operatorPhone: { type: String },
  callId: String,
});
