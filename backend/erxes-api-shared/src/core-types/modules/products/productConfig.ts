import { Document } from 'mongoose';

export interface IProductsConfig {
  code: string;
  value: any;
}

export interface IProductsConfigDocument extends IProductsConfig, Document {
  _id: string;
}
