import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface ICity {
  name: string;
  code: string;
  iso: string;
  stat: string;
  geoData: any;

  createdAt: Date;
  updatedAt: Date;
}

export interface ICityDocument extends ICity, Document {
  _id: string;
}

export interface ICityEdit extends ICity {
  _id: string;
}

export const citySchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'code', required: false, unique: true }),
    name: field({ type: String, label: 'name', required: true }),
    iso: field({ type: String, label: 'iso', required: false }),
    stat: field({ type: String, label: 'stat', required: false }),
    geoData: field({
      type: Schema.Types.Mixed,
      label: 'Geo data',
      required: false
    }),

    createdAt: field({
      type: Date,
      label: 'createdAt',
      required: true,
      default: Date.now
    }),
    updatedAt: field({
      type: Date,
      label: 'updatedAt',
      required: true,
      default: Date.now
    }),

    searchText: field({ type: String, optional: true, index: true })
  }),
  'mobinet_cities'
);
