import type { Document } from 'mongoose';

export interface IViberMessage {
  inboxId: string;
  messageToken: string;
  messageId: string;
  processedAt?: Date;
}

export interface IViberMessageDocument extends IViberMessage, Document {
  _id: string;
}
