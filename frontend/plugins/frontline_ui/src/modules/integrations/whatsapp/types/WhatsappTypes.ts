import { IAttachment } from 'erxes-ui';

export interface IWhatsappConversationMessage {
  _id: string;
  content: string;
  createdAt: string;
  attachments: IAttachment[];
  conversationId?: string;
  customerId?: string;
  userId?: string;
  internal?: boolean;
  mid?: string;
  isCustomerRead?: boolean;
}

export interface IWhatsappPhoneNumber {
  id: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
}

export interface IWhatsappBusinessAccount {
  id: string;
  name: string;
  phoneNumbers?: IWhatsappPhoneNumber[];
}
