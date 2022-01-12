import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

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

export interface IWebsiteCredentials {
  integrationId: string;
  description?: string;
  buttonText: string;
  url: string;
}

export type IMessengerAppCrendentials =
  | IGoogleCredentials
  | IKnowledgebaseCredentials
  | ILeadCredentials
  | IWebsiteCredentials;

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
export const messengerAppSchema = schemaHooksWrapper(
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
  }),
  'erxes_messenger_apps'
);

messengerAppSchema.index({ kind: 1, 'credentials.integrationId': 1 });