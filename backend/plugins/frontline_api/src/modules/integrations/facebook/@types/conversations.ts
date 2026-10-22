import { HydratedDocument } from 'mongoose';

export interface IFacebookConversationInputWait {
  executionId: string;
  actionId: string;
  // Unset when only "If Not Reply" is connected: a reply then just ends the wait.
  replyConnectId?: string;
  expiresAt: Date;
}

export interface IFacebookConversation {
  // id on erxes-api
  _id: string;
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  isBot: boolean;
  botId?: string;
  inputWait?: IFacebookConversationInputWait;
}

export type IFacebookConversationDocument =
  HydratedDocument<IFacebookConversation>;
