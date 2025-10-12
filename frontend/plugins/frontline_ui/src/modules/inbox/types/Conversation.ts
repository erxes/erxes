import { IAttachment } from 'erxes-ui';
import { ICustomerInline } from 'ui-modules';
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
