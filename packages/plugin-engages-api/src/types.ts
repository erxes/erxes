interface IShortMessage {
  content: string;
  from?: string;
  fromIntegrationId: string;
}

interface IIntegration {
  _id: string;
  kind: string;
  erxesApiId: string;
  telnyxProfileId?: string;
  telnyxPhoneNumber: string;
}

export interface IMessageParams {
  shortMessage: IShortMessage;
  to: string;
  integrations: IIntegration[];
}

export interface ITelnyxMessageParams {
  from: string;
  to: string;
  text: string;
  messaging_profile_id?: string;
  webhook_url?: string;
  webhook_failover_url?: string;
}

export interface ICallbackParams {
  engageMessageId?: string;
  msg: ITelnyxMessageParams;
}

interface ISenderParams {
  engageMessageId: string;
  customers: ICustomer[];
  createdBy: string;
  title: string;
  kind: string;
}

export interface IEmailParams extends ISenderParams {
  fromEmail: string;
  email: any;
}

export interface ISmsParams extends ISenderParams {
  shortMessage: IShortMessage;
}

export interface ICustomer {
  _id: string;
  primaryEmail: string;
  emailValidationStatus: string;
  primaryPhone: string;
  phoneValidationStatus: string;
  replacers: Array<{ key: string; value: string }>;
}

export interface ICampaign {
  _id: string;
  totalCustomersCount?: number;
  validCustomersCount?: number;
  runCount?: number;
}

// erxes-api definitions
interface IEmail {
  attachments?: any;
  subject?: string;
  content?: string;
  replyTo?: string;
  sender?: string;
  templateId?: string;
}

interface IEmailDocument extends IEmail, Document {}

interface IScheduleDate {
  type?: string;
  month?: string | number;
  day?: string | number;
  dateTime?: string | Date;
}

interface IScheduleDateDocument extends IScheduleDate, Document {}

interface IRule {
  kind: string;
  text: string;
  condition: string;
  value: string;
}

interface IMessenger {
  brandId?: string;
  kind?: string;
  sentAs?: string;
  content: string;
  rules?: IRule[];
}

interface IMessengerDocument extends IMessenger, Document {}

export interface IEngageMessage {
  kind: string;
  segmentIds?: string[];
  brandIds?: string[];
  // normal tagging
  tagIds?: string[];
  // customer selection tags
  customerTagIds?: string[];
  customerIds?: string[];
  title: string;
  fromUserId?: string;
  method: string;
  isDraft?: boolean;
  isLive?: boolean;
  stopDate?: Date;
  messengerReceivedCustomerIds?: string[];
  email?: IEmail;
  scheduleDate?: IScheduleDate;
  messenger?: IMessenger;
  lastRunAt?: Date;
  shortMessage?: IShortMessage;

  totalCustomersCount?: number;
  validCustomersCount?: number;
  runCount?: number;
}

export interface IEngageMessageDocument extends IEngageMessage, Document {
  scheduleDate?: IScheduleDateDocument;
  createdBy: string;
  createdAt: Date;

  email?: IEmailDocument;
  messenger?: IMessengerDocument;

  _id: string;
}

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

interface IEngageDataDocument extends IEngageData, Document {
  rules?: IEngageDataRulesDocument[];
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
  contentType?: string;
  bookingWidgetData?: any;
}

export interface IMessageDocument extends IMessage, Document {
  _id: string;
  engageData?: IEngageDataDocument;
  createdAt: Date;
}
