import { Document } from 'mongoose';

export interface IMailIntegration {
  inboxId?: string;
  pipelineId?: string;
  name?: string;
  address: string;
  forwardFrom?: string;
  senderName?: string;
  healthStatus?: string;
  error?: string;
  disabledAt?: Date | null;
}

export interface IMailIntegrationDocument extends IMailIntegration, Document {
  _id: string;
}
