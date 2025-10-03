export interface IFacebookCommentConversationReply {
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
  postId: string;
}

export interface IFacebookCommentConversationReplyDocument
  extends IFacebookCommentConversationReply,
    Document {}
