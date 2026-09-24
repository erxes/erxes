import { Document } from 'mongoose';

export interface IWhatsappAttachment {
  name?: string;
  url?: string;
  type?: string;
  size?: number;
}

export interface IWhatsappConversationMessage {
  mid: string;
  conversationId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: IWhatsappAttachment[];
  customerId?: string;
  visitorId?: string;
  userId?: string;
  fromBot?: boolean;
  isCustomerRead?: boolean;
  internal?: boolean;
}

export interface IWhatsappConversationMessageDocument
  extends IWhatsappConversationMessage,
    Document {
  _id: string;
}
