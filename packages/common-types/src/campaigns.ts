import { Document } from 'mongoose';

import { IRule } from './common';

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
