import { Document } from 'mongoose';

export interface ICommentConversationReply {
  mid: string;
  commentConversationId: string;
  parentId: String;
  recipientId: string;
  senderId: string;
  isResolved: boolean;
  comment_id: string;
  permalink_url: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: any;
  userId?: string;
  customerId?: string;
}

export interface ICommentConversationReplyDocument
  extends ICommentConversationReply,
    Document {}
