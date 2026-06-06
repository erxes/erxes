import { Document } from 'mongoose';

export interface IInstagramCommentConversationReply {
  mid: string;
  commentConversationId: string;
  parentId: string;
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

export interface IInstagramCommentConversationReplyDocument
  extends IInstagramCommentConversationReply, Document {}
