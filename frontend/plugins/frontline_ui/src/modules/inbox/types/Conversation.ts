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
  resolved: number;
}

export interface IConversationSourceProgressItem {
  source: string;
  count: number;
}

export interface IConversationSourceProgress {
  new: IConversationSourceProgressItem[];
  open: IConversationSourceProgressItem[];
  closed: IConversationSourceProgressItem[];
  resolved: IConversationSourceProgressItem[];
}

export interface IConversationTagProgressItem {
  tagId: string;
  count: number;
}

export interface IConversationTagProgress {
  new: IConversationTagProgressItem[];
  open: IConversationTagProgressItem[];
  closed: IConversationTagProgressItem[];
  resolved: IConversationTagProgressItem[];
}
