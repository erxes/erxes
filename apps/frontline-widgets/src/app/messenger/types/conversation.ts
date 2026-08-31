export interface ICustomer {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface IDetail {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  description?: string;
  location?: string;
  position?: string;
  shortName?: string;
}

export interface IUser {
  _id: string;
  details: IDetail;
  email?: string;
}

export interface IEngageData {
  content: string;
  kind: string;
  sentAs: string;
  messageId: string;
  brandId: string;
}

export interface IMessengerAppData {
  customer: ICustomer;
  hangoutLink: string;
}

export interface IAttachment {
  name: string;
  url: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface IMessagePoll {
  pollId?: string;
  question: string;
  answers: { id: string; text: string }[];
  allowMultiselect?: boolean;
  expiry?: string;
  results?: {
    isFinalized?: boolean;
    answerCounts: { id: string; count: number }[];
  };
}

export interface IMessage {
  _id: string;
  conversationId: string;
  user?: IUser;
  userId?: string;
  customerId?: string;
  content: string;
  contentType?: string;
  dailyStatus?: string;
  createdAt: Date;
  internal?: boolean;
  engageData: IEngageData;
  fromBot?: boolean;
  botData: any;
  messengerAppData: IMessengerAppData;
  attachments: IAttachment[];
  isCustomerRead?: boolean;
  extraData?: {
    poll?: IMessagePoll;
  };
}

export interface IConversation {
  _id: string;
  content: string;
  createdAt: string;
  customer: ICustomer;
  assignedUser?: IUser;
  messages: IMessage[];
  operatorStatus?: 'bot' | 'operator';
}

export interface IConversationMessage {
  _id: string;
  content: string;
  messages: IMessage[];
  createdAt?: Date;
  idleTime?: number;
  participatedUsers?: IDetail[];
}

export interface ISupporter {
  _id: string;
  isActive: boolean;
  isOnline: boolean;
  details: IDetail;
}
