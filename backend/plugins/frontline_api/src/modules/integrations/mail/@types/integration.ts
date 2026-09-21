import { Document } from 'mongoose';

export interface IMailForwardVerification {
  from?: string;
  subject?: string;
  code?: string;
  link?: string;
  excerpt?: string;
  receivedAt?: Date;
}

export interface IMailIntegration {
  inboxId?: string;
  pipelineId?: string;
  name?: string;
  address: string;
  forwardFrom?: string;
  forwardPendingAt?: Date | null;
  forwardVerification?: IMailForwardVerification | null;
  senderName?: string;
  healthStatus?: string;
  error?: string;
  disabledAt?: Date | null;
}

export interface IMailIntegrationDocument extends IMailIntegration, Document {
  _id: string;
}
