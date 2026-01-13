import { Document } from 'mongoose';

export interface ICommentConversation {
  postId: string;
  mid: string;
  comment_id: string;
  recipientId: string;
  senderId: string;
  content: string;
  erxesApiId?: string;
  customerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: any;
}

export interface ICommentConversationDocument
  extends ICommentConversation,
    Document {
  isResolved: any;
}
