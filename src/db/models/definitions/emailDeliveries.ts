import { Document, Schema } from 'mongoose';
import { field } from '../utils';

interface IAttachmentParams {
  data: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IEmailDeliveries {
  cocType: string;
  cocId?: string;
  subject: string;
  body: string;
  toEmails: string;
  cc?: string;
  bcc?: string;
  attachments?: IAttachmentParams[];
  fromEmail?: string;
  type?: string;
  userId: string;
}

export interface IEmailDeliveriesDocument extends IEmailDeliveries, Document {
  id: string;
}

// Mongoose schemas ===========

const attachmentSchema = new Schema(
  {
    data: field({ type: String }),
    filename: field({ type: String }),
    size: field({ type: Number }),
    mimeType: field({ type: String }),
  },
  { _id: false },
);

export const emailDeliverySchema = new Schema({
  _id: field({ pkey: true }),
  cocType: field({ type: String }),
  cocId: field({ type: String }),
  subject: field({ type: String, optional: true }),
  body: field({ type: String }),
  toEmails: field({ type: String }),
  cc: field({ type: String, optional: true }),
  bcc: field({ type: String, optional: true }),
  attachments: field({ type: [attachmentSchema] }),
  fromEmail: field({ type: String }),
  userId: field({ type: String }),

  type: { type: String },

  createdAt: field({ type: Date, default: Date.now }),
});
