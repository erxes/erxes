import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface IDistrict {
  name: string;
  code: string;
  cityId: string;
  center: any;

  createdAt: Date;
  updatedAt: Date;
}

export interface IDistrictDocument extends IDistrict, Document {
  _id: string;
}

export interface IDistrictEdit extends IDistrict {
  _id: string;
}

export const districtSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'code', required: false }),
    name: field({ type: String, label: 'name', required: true }),
    cityId: field({ type: String, label: 'city', required: false }),
    center: field({
      type: Schema.Types.Mixed,
      label: 'Center location',
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
  'mobinet_districts'
);
