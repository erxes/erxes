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
  body?: string;
  content?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: IAttachmentParams[];
  from: string;
  kind: string;
  userId?: string;
  customerId?: string;
  status?: string;
  email?: string;
  provider?: string;
}

export interface IEmailDeliveriesDocument extends IEmailDeliveries, Document {
  id: string;
}

export interface IEmailParams {
  toEmails?: string[];
  fromEmail?: string;
  title?: string;
  customHtml?: string;
  customHtmlData?: any;
  template?: { name?: string; data?: any };
  attachments?: object[];
  modifier?: (data: any, email: string) => void;
  transportMethod?: string;
  getOrganizationDetail?: ({ subdomain }: { subdomain: string }) => any;
  userId: string;
}
