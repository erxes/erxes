import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface IQuarter {
  name: string;
  code: string;
  order: number;
  cityId: string;
  districtId: string;
  center: any;

  createdAt: Date;
  updatedAt: Date;
}

export interface IQuarterDocument extends IQuarter, Document {
  _id: string;
}

export interface IQuarterEdit extends IQuarter {
  _id: string;
}

export const quarterSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'code', required: false }),
    name: field({ type: String, label: 'name', required: true }),
    order: field({ type: Number, label: 'order', required: false }),
    cityId: field({ type: String, label: 'city', required: false }),
    districtId: field({ type: String, label: 'district', required: false }),
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
  'mobinet_quarters'
);
