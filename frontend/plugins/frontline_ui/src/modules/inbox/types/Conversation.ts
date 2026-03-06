import { IAttachment } from 'erxes-ui';
import { ICustomerInline, IUser } from 'ui-modules';
import { IFormWidgetItem } from './FormWidget';

export interface IConversation {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  customer: ICustomerInline;
  customerId?: string;
  integrationId?: string;
  readUserIds?: string[];
  assignedUserId?: string;
  assignedUser?: IUser;
  tagIds?: string[];
  status?: ConversationStatus;
}

export interface IMessage {
  _id: string;
  userId?: string;
  customerId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments?: IAttachment[];
  formWidgetData?: IFormWidgetItem[];
  internal?: boolean;
}

export enum ConversationStatus {
  NEW = '',
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface IConversationMemberProgress {
  assigneeId: string;
  new: number;
  open: number;
  closed: number;
}

export interface IConversationSourceProgressItem {
  count: number;
  source: string;
}

export interface IConversationSourceProgress {
  conversationSourceProgress: {
    new: IConversationSourceProgressItem[];
    open: IConversationSourceProgressItem[];
    closed: IConversationSourceProgressItem[];
  }[];
}

export interface IConversationTagProgressItem {
  count: number;
  tagId: string;
}

export interface IConversationTagProgress {
  conversationTagProgress: {
    new: IConversationTagProgressItem[];
    open: IConversationTagProgressItem[];
    closed: IConversationTagProgressItem[];
  }[];
}
