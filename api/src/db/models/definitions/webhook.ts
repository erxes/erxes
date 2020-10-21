import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IWebhookAction {
  action?: string;
  type?: string;
  label?: string;
}

const webhookActionSchema = new Schema(
  {
    action: field({ type: String }),
    type: field({ type: String }),
    label: field({ type: String }),
  },
  { _id: false },
);

export interface IWebhookActionDocument extends IWebhookAction, Document {}

export interface IWebhook {
  url: string;
  token?: string;
  actions: IWebhookActionDocument[];
  status?: string;
}

export interface IWebhookDocument extends IWebhook, Document {
  _id: string;
}

// Mongoose schemas ===========

export const webhookSchema = new Schema({
  _id: field({ pkey: true }),
  url: field({ type: String, required: true, unique: true }),
  token: field({ type: String }),
  actions: field({ type: [webhookActionSchema], label: 'actions' }),
  status: field({ type: String }),
});
