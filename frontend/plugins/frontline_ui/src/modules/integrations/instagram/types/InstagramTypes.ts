import { IAttachment } from 'erxes-ui';

export interface IInstagramPost {
  _id: string;
  content: string;
  permalink_url: string;
  attachments: IAttachment[];
}

export interface IInstagramConversationMessage {
  _id: string;
  content: string;
  createdAt: string;
  attachments: IAttachment[];
  customerId?: string;
  userId?: string;
  internal?: boolean;
  mid?: string;
}

export interface IInstagramComment {
  _id: string;
  content: string;
  conversationId: string;
  commentId: string;
  postId: string;
  recipientId: string;
  senderId: string;
  erxesApiId: string;
  timestamp: string;
  permalink_url: string;
  parentId: string;
  commentCount: number;
  isResolved: boolean;
  customer?: {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
    profilePic: string;
  };
}

export enum EnumInstagramTag {
  CONFIRMED_EVENT_UPDATE = 'CONFIRMED_EVENT_UPDATE',
  POST_PURCHASE_UPDATE = 'POST_PURCHASE_UPDATE',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
}
