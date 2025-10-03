import { IAttachment } from 'erxes-ui';

export interface IFacebookConversationMessage {
  _id: string;
  content: string;
  createdAt: string;
  attachments: IAttachment[];
  customerId?: string;
  userId?: string;
  internal?: boolean;
}

export enum EnumFacebookTag {
  CONFIRMED_EVENT_UPDATE = 'CONFIRMED_EVENT_UPDATE',
  POST_PURCHASE_UPDATE = 'POST_PURCHASE_UPDATE',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
}
