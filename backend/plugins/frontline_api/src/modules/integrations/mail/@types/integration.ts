import { Document } from 'mongoose';

export interface IMailIntegration {
  inboxId: string;
  address: string;
  forwardFrom?: string;
  senderName?: string;
  healthStatus?: string;
  error?: string;
}

export interface IMailIntegrationDocument extends IMailIntegration, Document {
  _id: string;
}
