import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';

export interface ICommonAdjusting {
  date: Date;

}

export interface ICommonAdjustingDocument extends ICommonAdjusting, Document {
  _id: string;
  createdAt: Date;
}

export const accountSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    
  }),
);
