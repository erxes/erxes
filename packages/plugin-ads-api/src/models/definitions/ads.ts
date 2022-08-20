import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface Iads {}

export interface IadsDocument extends Iads, Document {
  _id: string;
}

export const adsSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true })
  }),
  'erxes_ads'
);
