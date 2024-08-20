import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

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
  sendSales?: string[];
  responseSales?: string[];
  error?: string;
}

export interface ISyncLogDocument extends ISyncLog, Document {
  _id: string;
}

export interface ICustomerRelation {
  customerId: string;
  brandId: string;
  no: string;
  modifiedAt: Date;
  filter: string;
  response: any;
}

export interface ICustomerRelationDocument extends ICustomerRelation, Document {
  _id: string;
}

export const syncLogSchema = schemaWrapper(
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

export const customerRelationSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    customerId: field({ type: String, index: true }),
    brandId: field({ type: String, index: true }),
    no: field({ type: String, index: true }),
    modifiedAt: field({ type: Date }),
    filter: field({ type: String }),
    response: field({ type: Object }),
  })
);
