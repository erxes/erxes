import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IConfig {
  contentType: string;
  contentId: string;
  createdAt: Date;
  createdBy?: string;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

export const configSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contentType: field({ type: String, label: 'type', index: true }),
    contentId: field({ type: String, label: 'content', index: true }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
      index: true,
    }),
    createdBy: field({ type: String, optional: true, label: 'Created by' }),
    consumeData: field({ type: Object }),
    consumeStr: field({ type: String }),
    sendData: field({ type: Object, optional: true }),
    sendStr: field({ type: String, optional: true }),
    responseData: field({ type: Object, optional: true }),
    responseStr: field({ type: String, optional: true }),
    sendSales: field({ type: [String], optional: true }),
    responseSales: field({ type: [String], optional: true }),
    error: field({ type: String, optional: true }),
  })
);
