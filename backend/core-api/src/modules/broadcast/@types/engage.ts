import { IRule } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

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

export interface IScheduleDateDocument extends IScheduleDate, Document {}

interface IMessenger {
  brandId?: string;
  kind?: string;
  sentAs?: string;
  content: string;
  rules?: IRule[];
}

interface IMessengerDocument extends IMessenger, Document {}

export interface IShortMessage {
  content: string;
  from?: string;
  fromIntegrationId: string;
}

interface INotification {
  title?: string;
  content?: string;
  isMobile?: boolean;
}

interface INotificationDocument extends INotification, Document {}
export interface IShortMessage {
  content: string;
  from?: string;
  fromIntegrationId: string;
}

export interface IEngageMessage {
  kind: string;
  segmentIds?: string[];
  brandIds?: string[];
  // normal tagging
  tagIds?: string[];
  // customer selection tags
  customerTagIds?: string[];
  customerIds?: string[];
  cpId: string;
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
  notification?: INotification;
  lastRunAt?: Date;
  shortMessage?: IShortMessage;

  totalCustomersCount?: number;
  validCustomersCount?: number;
  runCount?: number;
  createdBy?: string;
  forceCreateConversation?: boolean;
}

export interface IEngageMessageDocument extends IEngageMessage, Document {
  scheduleDate?: IScheduleDateDocument;
  createdAt: Date;

  email?: IEmailDocument;
  messenger?: IMessengerDocument;
  notification?: INotificationDocument;
  _id: string;
}

export interface IEngageQueryParams {
  kind?: string;
  status?: string;
  tag?: string;
  ids?: string;
}
