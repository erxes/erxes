import { ICursorPaginateParams, IRule } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

interface IEmail {
  attachments?: any;
  subject?: string;
  content?: string;
  replyTo?: string;
  sender?: string;
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
  channelId?: string;
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
  inApp?: boolean;
}

interface INotificationDocument extends INotification, Document {}
export interface IShortMessage {
  content: string;
  from?: string;
  fromIntegrationId: string;
}

export interface IEngageMessage {
  kind: string;
  targetType: string;
  targetIds: string[];
  targetCount: number;

  cpId: string;
  title: string;
  fromUserId?: string;
  method: string;
  isDraft?: boolean;
  isLive?: boolean;

  messengerReceivedCustomerIds?: string[];
  email?: IEmail;
  messenger?: IMessenger;
  notification?: INotification;

  lastRunAt?: Date;

  totalCustomersCount?: number;
  validCustomersCount?: number;

  runCount?: number;
  createdBy?: string;
}

export interface IEngageMessageDocument extends IEngageMessage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  email?: IEmailDocument;
  messenger?: IMessengerDocument;
  notification?: INotificationDocument;
}

export interface IEngageQueryParams extends ICursorPaginateParams {
  kind?: string;
  status?: string;
  tag?: string;
  method?: string;
  brandId?: string;
  fromUserId?: string;
  searchValue?: string;
}
