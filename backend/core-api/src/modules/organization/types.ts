import { Document } from 'mongoose';

export interface IOrganizationCharge {
  [key: string]: {
    free: number;
    purchased: number;
    used: number;
  };
}

export interface IAttachmentParams {
  data: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IEmailDeliveries {
  subject: string;
  content?: string;
  toEmails: string[];
  ccEmails?: string[];
  from?: string;
  provider: 'sendgrid' | 'smtp' | 'ses';
  status?: 'queued' | 'sent' | 'failed';
  messageId?: string;
  /** What produced this email, e.g. 'automation' | 'broadcast' | 'transactional'. */
  source?: string;
  sourceId?: string;
  userId?: string;
  notificationId?: string;
}

export interface IEmailDeliveriesDocument extends IEmailDeliveries, Document {
  _id: string;
}

export interface IEmailParams {
  toEmails?: string[];
  fromEmail?: string;
  title?: string;
  customHtml?: string;
  customHtmlData?: any;
  template?: { name?: string; data?: any };
  attachments?: object[];
  modifier?: (data: any, email: string) => Promise<void>;
  transportMethod?: string;
  getOrganizationDetail?: ({ subdomain }: { subdomain: string }) => any;
  userId?: string;
}
