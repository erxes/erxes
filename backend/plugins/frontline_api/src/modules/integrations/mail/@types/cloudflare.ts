import { Document } from 'mongoose';

export type TMailProvisionState = 'pending' | 'ok' | 'failed';

export interface IMailProvisionStep {
  name: string;
  state: TMailProvisionState;
  error?: string;
  ranAt?: Date;
}

export interface IMailCloudflare {
  accountId: string;
  accountName?: string;
  zoneId: string;
  zoneName: string;
  tenant: string;
  workerName: string;
  workerOrigin?: string;
  bucketName: string;
  queueName: string;
  dlqName: string;
  apiToken: string;
  webhookSecret: string;
  sendingEnabled?: boolean;
  sendingTag?: string;
  scriptVersion?: string;
  status: string;
  steps?: IMailProvisionStep[];
  error?: string;
  connectedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMailCloudflareDocument extends IMailCloudflare, Document {
  _id: string;
}

export interface IMailCloudflareZone {
  id: string;
  name: string;
  status: string;
  accountId: string;
  accountName: string;
}

export interface IMailCloudflareConnectArgs {
  token: string;
  zoneId: string;
}

export interface ICloudflareSendingSubdomain {
  name: string;
  enabled?: boolean;
  tag: string;
}

export interface ICloudflareSendingDnsRecord {
  type?: string;
  name?: string;
  content?: string;
  priority?: number;
}

export interface ICloudflareSendingQuota {
  value: number;
  unit: string;
}

export interface ICloudflareSendAddress {
  address: string;
  name?: string;
}

export interface ICloudflareSendAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
  content_id?: string;
}

export interface ICloudflareSendPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: ICloudflareSendAddress;
  reply_to?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: ICloudflareSendAttachment[];
  headers?: Record<string, string>;
}

export interface ICloudflareSendResult {
  delivered?: string[];
  permanent_bounces?: string[];
  queued?: string[];
}
