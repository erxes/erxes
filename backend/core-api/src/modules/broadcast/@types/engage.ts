import { TBroadcastRecurrence } from '@/broadcast/utils/recurrence';
import { ICursorPaginateParams, IRule } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

interface IEmail {
  attachments?: any;
  subject?: string;
  content?: string;
  replyTo?: string;
  sender?: string;
}

export interface IEmailDocument extends IEmail, Document {}

/**
 * One moment, or the pattern that keeps producing them. The recurrence half is
 * what the scheduler reads; both halves live in the same subdocument because a
 * campaign only ever has one schedule.
 */
interface IScheduleDate extends TBroadcastRecurrence {
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
  brandId?: string;
}

export interface IMessengerDocument extends IMessenger, Document {}

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

export interface INotificationDocument extends INotification, Document {}
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
  fromEmail?: string;
  fromUserId?: string;
  method: string;
  isDraft?: boolean;
  isLive?: boolean;
  scheduleDate?: IScheduleDate;

  messengerReceivedCustomerIds?: string[];
  // Draft flow sent with a workflow campaign; stored on the automation it
  // owns, never on the campaign document.
  workflow?: { actions?: any[]; entryActionId?: string };
  email?: IEmail;
  messenger?: IMessenger;
  notification?: INotification;

  lastRunAt?: Date;

  status: 'sending' | 'completed' | 'failed';
  progress: {
    totalBatches: number;
    processedBatches: number;
    successCount: number;
    failureCount: number;
    lastUpdated: Date;
  };

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
  scheduleDate?: IScheduleDateDocument;
}

export interface IEngageQueryParams extends ICursorPaginateParams {
  kind?: string;
  /** manual | scheduled | recurring — what starts the campaign. */
  trigger?: string;
  status?: string;
  tag?: string;
  method?: string;
  brandId?: string;
  fromUserId?: string;
  searchValue?: string;
}
