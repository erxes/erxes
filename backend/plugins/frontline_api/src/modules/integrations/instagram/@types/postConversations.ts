import { Document } from 'mongoose';


export interface IPostConversation {
  // id on erxes-api
  erxesApiId?: string;
  postId: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  customerId?: string;
  permalink_url: String;
  attachments: string[];
}

export interface IPostConversationDocument
  extends IPostConversation,
    Document {}
