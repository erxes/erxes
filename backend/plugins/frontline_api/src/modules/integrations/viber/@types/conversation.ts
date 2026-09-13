import type { Document } from 'mongoose';

export interface IViberConversation {
  inboxId: string;
  userId: string;
  conversationId: string;
}

export interface IViberConversationDocument
  extends IViberConversation,
    Document {
  _id: string;
}
