import { Document } from 'mongoose';

export interface IWhatsappIntegration {
  kind: string;
  erxesApiId: string;
  accountId?: string;
  phoneNumberId: string;
  accessToken: string;
  businessAccountId?: string;
  pageId?: string;
  healthStatus?: string;
  error?: string;
}

export interface IWhatsappIntegrationDocument
  extends IWhatsappIntegration,
    Document {
  _id: string;
}
