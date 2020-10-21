import { Document, Schema } from 'mongoose';
import { field } from './utils';

interface IAttachmentParams {
  data: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IEmailDeliveries {
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: IAttachmentParams[];
  from: string;
  kind: string;
  userId?: string;
  customerId?: string;
  status?: string;
}

export interface IEmailDeliveriesDocument extends IEmailDeliveries, Document {
  id: string;
}

export const EMAIL_DELIVERY_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  ALL: ['pending', 'received'],
};

export const emailDeliverySchema = new Schema({
  _id: field({ pkey: true }),
  subject: field({ type: String }),
  body: field({ type: String }),
  to: field({ type: [String] }),
  cc: field({ type: [String], optional: true }),
  bcc: field({ type: [String], optional: true }),
  attachments: field({ type: [Object] }),
  from: field({ type: String }),
  kind: field({ type: String }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now }),
  status: field({
    type: String,
    enum: EMAIL_DELIVERY_STATUS.ALL,
  }),
});
