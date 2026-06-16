import { IAttachment } from 'erxes-ui';

export interface IWhatsappConversationMessage {
  _id: string;
  content: string;
  createdAt: string;
  attachments: IAttachment[];
  customerId?: string;
  userId?: string;
  internal?: boolean;
  mid?: string;
}
