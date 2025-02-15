import { field, schemaWrapper } from './utils';
import { Schema, Document } from 'mongoose';

export interface ISyncLog {
  contentType?: string;
  contentId?: string;
  createdAt: Date;
  createdBy?: string;
  consumeData?: any;
  consumeStr?: string;
  sendData?: any;
  sendStr?: string;
  header?: string;
  responseData?: any;
  responseStr?: string;
  error?: string;
}

export interface ISyncLogDocument extends ISyncLog, Document {
  _id: string;
}

export const syncLogSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contentType: field({ type: String, label: 'type', optional: true,  index: true }),
    contentId: field({ type: String, label: 'content', optional: true, index: true }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
      index: true,
    }),
    createdBy: field({ type: String, optional: true, label: 'Created by' }),
    consumeData: field({ type: Object, optional: true,  }),
    consumeStr: field({ type: String, optional: true,  }),
    sendData: field({ type: Object, optional: true }),
    sendStr: field({ type: String, optional: true }),
    header: field({ type: String, optional: true }),
    responseData: field({ type: Object, optional: true }),
    responseStr: field({ type: String, optional: true }),
    error: field({ type: String, optional: true }),
  }),
);

syncLogSchema.index({ contentType: 1, contentId: 1 });
