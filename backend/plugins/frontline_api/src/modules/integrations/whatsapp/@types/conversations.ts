import { HydratedDocument } from 'mongoose';

export interface IWhatsappConversation {
  _id: string;
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
}

export type IWhatsappConversationDocument =
  HydratedDocument<IWhatsappConversation>;
