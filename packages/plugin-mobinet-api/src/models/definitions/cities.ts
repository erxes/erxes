import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface ICity {
  name: string;
  code: string;
  iso: string;
  stat: any;
  center: any;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ICityDocument extends ICity, Document {
  _id: string;
}

export interface ICityEdit extends ICity {
  _id: string;
}

export const placeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'code', required: false }),
    name: field({ type: String, label: 'name', required: true }),
    iso: field({ type: String, label: 'iso', required: false }),
    stat: field({ type: Schema.Types.Mixed, label: 'stat', required: false }),
    center: field({
        type: Schema.Types.Mixed,
        label: 'Center location',
        required: false
      }),
    createdAt: field({ type: Date, label: 'createdAt', required: true }),
    updatedAt: field({ type: Date, label: 'updatedAt', required: true }),

    searchText: field({ type: String, optional: true, index: true })
  }),
  'mobinet_cities'
);
