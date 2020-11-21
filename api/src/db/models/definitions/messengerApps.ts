import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IGoogleCredentials {
  access_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface IKnowledgebaseCredentials {
  integrationId: string;
  topicId: string;
}

export interface ILeadCredentials {
  integrationId: string;
  formCode: string;
}

export type IMessengerAppCrendentials =
  | IGoogleCredentials
  | IKnowledgebaseCredentials
  | ILeadCredentials;

export interface IMessengerApp {
  kind: 'googleMeet' | 'knowledgebase' | 'lead' | 'website';
  name: string;
  accountId?: string;
  showInInbox?: boolean;
  credentials?: IMessengerAppCrendentials;
}

export interface IMessengerAppDocument extends IMessengerApp, Document {
  _id: string;
}

// Messenger apps ===============
export const messengerAppSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),

    kind: field({
      type: String,
      enum: ['googleMeet', 'knowledgebase', 'lead', 'website']
    }),

    name: field({ type: String }),
    accountId: field({ type: String, optional: true }),
    showInInbox: field({ type: Boolean, default: false }),
    credentials: field({ type: Object })
  })
);
