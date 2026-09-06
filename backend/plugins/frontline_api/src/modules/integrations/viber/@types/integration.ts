import { Document } from 'mongoose';

export interface IViberIntegration {
  inboxId: string;
  botId: string;
  token: string;
}

export interface IViberIntegrationDocument extends IViberIntegration, Document {
  _id: string;
}
