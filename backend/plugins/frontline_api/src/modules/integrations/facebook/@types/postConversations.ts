import { Document } from 'mongoose';

export interface IFacebookPostConversation {
  // id on erxes-api
  erxesApiId?: string;
  postId: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  customerId?: string;
  permalink_url: string;
  attachments: string[];
}

export interface IFacebookPostConversationDocument
  extends IFacebookPostConversation,
    Document {}
