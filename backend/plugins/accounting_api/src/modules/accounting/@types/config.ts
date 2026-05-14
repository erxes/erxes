import { Document } from 'mongoose';

export interface IConfig {
  code: string;
  value: any;
}

export interface IConfigDocument
  extends IConfig,
  Document {
  _id: string;
}
