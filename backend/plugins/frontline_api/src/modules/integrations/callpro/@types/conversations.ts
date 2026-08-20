import { Document } from 'mongoose';

export interface ICallProConversation {
  erxesApiId?: string;
  senderPhoneNumber: string;
  recipientPhoneNumber: string;
  state: string;
  integrationId: string;
  callId: string;
}

export interface ICallProConversationDocument
  extends ICallProConversation,
    Document {
  _id: string;
}
