export interface IInstagramCommentConversation {
  postId: string;
  mid: string;
  comment_id: string;
  parentId?: string;
  recipientId: string;
  senderId: string;
  content: string;
  erxesApiId?: string;
  customerId?: string;
  isResolved?: boolean;
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: any;
}

export interface IInstagramCommentConversationDocument
  extends IInstagramCommentConversation, Document {}
