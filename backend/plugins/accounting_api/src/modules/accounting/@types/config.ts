import { Document } from 'mongoose';

export interface IAccountingConfig {
  code: string;
  value: any;
}

export interface IAccountingConfigDocument
  extends IAccountingConfig,
  Document {
  _id: string;
}
