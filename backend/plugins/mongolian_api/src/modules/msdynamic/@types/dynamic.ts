import { Document } from 'mongoose';

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
