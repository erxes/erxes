import { Document } from 'mongoose';
import { IEmailProviderConfig } from 'erxes-api-shared/utils';

export type TMailSendingProvider = 'SES' | 'sendgrid';

export type TMailSendingStatus = 'pending' | 'verified' | 'failed';

export interface IMailSendingDnsRecord {
  type: string;
  host: string;
  data: string;
  valid: boolean;
}

export interface IMailSendingAccount {
  name: string;
  provider: TMailSendingProvider;
  domain: string;
  config: IEmailProviderConfig;
  platformManaged: boolean;
  verifyToken?: string;
  senderId?: string;
  status: TMailSendingStatus;
  dnsRecords?: IMailSendingDnsRecord[];
  error?: string;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMailSendingAccountDocument
  extends IMailSendingAccount,
    Document {
  _id: string;
}

export interface IMailSendingAccountInput {
  name: string;
  provider?: TMailSendingProvider;
  domain: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  sendgridApiKey?: string;
}
