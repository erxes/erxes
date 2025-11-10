import { Schema, Document } from 'mongoose';

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

export const syncLogSchema = 
  new Schema({
    _id: ({ pkey: true }),
    contentType: ({ type: String, label: 'type', index: true }),
    contentId: ({ type: String, label: 'content', index: true }),
    createdAt: ({
      type: Date,
      default: new Date(),
      label: 'Created at',
      index: true,
    }),
    createdBy: ({ type: String, optional: true, label: 'Created by' }),
    consumeData: ({ type: Object }),
    consumeStr:({ type: String }),
    sendData: ({ type: Object, optional: true }),
    sendStr: ({ type: String, optional: true }),
    responseData: ({ type: Object, optional: true }),
    responseStr: ({ type: String, optional: true }),
    sendSales: ({ type: [String], optional: true }),
    responseSales: ({ type: [String], optional: true }),
    error: ({ type: String, optional: true }),
  });


export const customerRelationSchema = 
  new Schema({
    _id: ({ pkey: true }),
    customerId: ({ type: String, index: true }),
    brandId: ({ type: String, index: true }),
    no: ({ type: String, index: true }),
    modifiedAt: ({ type: Date }),
    filter: ({ type: String }),
    response: ({ type: Object }),
  });
