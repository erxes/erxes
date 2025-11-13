interface IEngageDataRules {
  kind: string;
  text: string;
  condition: string;
  value?: string;
}

interface IEngageDataRulesDocument extends IEngageDataRules, Document {}

export interface IEngageData {
  messageId: string;
  brandId: string;
  content: string;
  fromUserId: string;
  kind: string;
  sentAs: string;
  rules?: IEngageDataRules[];
}

export interface IMessage {
  content?: string;
  createdAt?: Date;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  fromBot?: boolean;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  botData?: any;
  messengerAppData?: any;
  engageData?: IEngageData;
  // contentType?: string;
}

interface IEngageDataDocument extends IEngageData, Document {
  rules?: IEngageDataRulesDocument[];
}

export interface IMessageDocument extends IMessage, Document {
  _id: string;
  engageData?: IEngageDataDocument;
  createdAt: Date;
}

export interface ICampaign {
  _id: string;
  totalCustomersCount?: number;
  validCustomersCount?: number;
  runCount?: number;
}
