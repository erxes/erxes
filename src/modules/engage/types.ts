import { IUser } from '../auth/types';
import { IAttachment } from '../common/types';
import { ISegment } from '../segments/types';
import { IBrand } from '../settings/brands/types';
import { ITag } from '../tags/types';

export interface IEngageScheduleDate {
  type: string;
  month: string;
  day: string;
  time: Date;
}

export interface IEngageRule {
  _id: string;
  kind?: string;
  text: string;
  condition: string;
  value: string;
}

export interface IEngageMessenger {
  brandId: string;
  kind?: string;
  sentAs: string;
  content: string;
  rules?: IEngageRule[];
}

export interface IEngageEmail {
  templateId?: string;
  subject: string;
  content: string;
  attachments?: IAttachment[];
}

export interface IEngageStats {
  send: number;
  delivery: number;
  open: number;
  click: number;
  complaint: number;
  bounce: number;
  renderingfailure: number;
  reject: number;
}

export interface IEngageMessageDoc {
  kind?: string;
  type?: string;
  segmentId?: string;
  customerIds?: string[];
  title: string;
  fromUserId?: string;
  method: string;
  isDraft?: boolean;
  isLive?: boolean;
  email?: IEngageEmail;
  messenger?: IEngageMessenger;
  scheduleDate?: IEngageScheduleDate;
}

export interface IEngageMessage extends IEngageMessageDoc {
  _id: string;
  stopDate: Date;
  createdDate: Date;
  messengerReceivedCustomerIds?: string[];
  deliveryReports?: JSON;
  stats?: IEngageStats;
  brand: IBrand;
  segment: ISegment;
  fromUser: IUser;
  tagIds: string[];
  getTags: ITag[];
}
