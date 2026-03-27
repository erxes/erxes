export interface IInstagramCommentConversation {
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

export interface IInstagramCommentConversationDocument
  extends IInstagramCommentConversation, Document {
  isResolved: any;
}
