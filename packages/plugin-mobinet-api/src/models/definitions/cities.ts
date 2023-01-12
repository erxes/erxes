import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface ICity {
  name: string;
  nameEn: string;
  code: string;
  iso: string;
  stat: string;
  center: any;

  boundingBox: number[];

  geojson: any;

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
    nameEn: field({ type: String, label: 'English name', required: false }),
    iso: field({ type: String, label: 'iso', required: false }),
    stat: field({ type: String, label: 'stat', required: false }),
    center: {
      type: {
        type: String,
        enum: ['Point'],
        optional: true
      },
      coordinates: {
        type: [Number],
        optional: true
      },
      required: false
    },

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

    boundingBox: field({
      type: [Number],
      label: 'boundingBox',
      required: false,
      default: []
    }),

    geojson: field({
      type: Schema.Types.Mixed,
      label: 'Geo data',
      required: false
    }),

    searchText: field({ type: String, optional: true, index: true })
  }),
  'mobinet_cities'
);

citySchema.index({ center: '2dsphere' });
