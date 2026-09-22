import { Document } from 'mongoose';

export interface ICallProIntegration {
  inboxId: string;
  phoneNumber: string;
  recordUrl?: string;
}

export interface ICallProIntegrationDocument
  extends ICallProIntegration,
    Document {
  _id: string;
}
