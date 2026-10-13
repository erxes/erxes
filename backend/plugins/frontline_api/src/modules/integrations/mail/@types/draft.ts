import { Document } from 'mongoose';

export type TMailDraftStatus = 'pending' | 'sending' | 'sent';

export interface IMailDraft {
  inboxIntegrationId: string;
  inboxConversationId: string;
  sourceMessageId: string;
  customerId?: string;
  to: string[];
  subject: string;
  body: string;
  replyToMessageId?: string;
  references?: string[];
  shouldResolve?: boolean;
  senderMismatch?: boolean;
  status: TMailDraftStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMailDraftDocument extends IMailDraft, Document {
  _id: string;
}

export interface IMailDraftChangedEvent {
  _id: string;
  conversationId: string;
  status: TMailDraftStatus;
}

export type IMailDraftInput = Omit<
  IMailDraft,
  'status' | 'createdAt' | 'updatedAt'
>;

export interface IMailDraftEdit {
  subject?: string;
  body: string;
}
