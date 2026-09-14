import type { Document } from 'mongoose';
import type { IAttachment } from 'erxes-api-shared/core-types';

export type ViberSendState =
  | 'pending'
  | 'sending'
  | 'sent'
  | 'rejected'
  | 'unknown';

export type ViberMessageBody =
  | { type: 'text'; text: string }
  | { type: 'picture'; media: string; text: string }
  | { type: 'video'; media: string; size: number }
  | { type: 'file'; media: string; size: number; file_name: string }
  | { type: 'url'; media: string }
  | { type: 'location'; location: { lat: number; lon: number } }
  | { type: 'contact'; contact: { name: string; phone_number: string } }
  | { type: 'sticker'; sticker_id: string };

export interface IViberSendPart {
  body: ViberMessageBody;
  attachment?: IAttachment;
  state: ViberSendState;
  messageToken?: string;
  error?: string;
}

export interface IViberOutbox {
  _id: string;
  inboxId: string;
  conversationId: string;
  userId: string;
  agentId: string;
  state: ViberSendState;
  parts: IViberSendPart[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IViberOutboxDocument extends IViberOutbox, Document {
  _id: string;
}

export interface IViberSubscriptionDocument extends Document {
  _id: string;
  inboxId: string;
  userId: string;
  subscribed: boolean;
  timestamp: number;
}

export interface IViberReceiptDocument extends Document {
  _id: string;
  inboxId: string;
  userId: string;
  messageToken: string;
  deliveredAt?: Date;
  seenAt?: Date;
  failedAt?: Date;
  createdAt: Date;
}
