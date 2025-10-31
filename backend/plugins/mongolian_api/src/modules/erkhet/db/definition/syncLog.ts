import { Schema, Document } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export interface ISyncLog {
  contentType: string;
  contentId: string;
  createdAt: Date;
  createdBy?: string;
  consumeData: any;
  consumeStr: string;
  sendData?: any;
  sendStr?: string;
  responseData?: any;
  responseStr?: string;
  error?: string;
}

export interface ISyncLogDocument extends ISyncLog, Document {
  _id: string;
  id: string;
}


export const syncLogSchema = new Schema({
  _id: mongooseStringRandomId,

  contentType: { type: String, label: 'type', index: true },
  contentId: { type: String, label: 'content', index: true },
  createdAt: { type: Date, label: 'Created at', index: true, default: new Date() },
  createdBy: { type: String, label: 'Created by', optional: true },

  consumeData: { type: Object, label: 'consumeData' },
  consumeStr: { type: String, label: 'consumeStr' },

  sendData: { type: Object, label: 'sendData', optional: true },
  sendStr: { type: String, label: 'sendStr', optional: true },

  responseData: { type: Object, label: 'responseData', optional: true },
  responseStr: { type: String, label: 'responseStr', optional: true },

  error: { type: String, label: 'error', optional: true },
});


