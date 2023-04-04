import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface IDistrict {
  name: string;
  nameEn: string;
  code: string;
  cityId: string;
  center: any;

  boundingBox: number[];

  geojson: any;

  createdAt: Date;
  updatedAt: Date;
  isCapital: boolean;
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
    nameEn: field({ type: String, label: 'English name', required: false }),
    cityId: field({ type: String, label: 'city', required: false }),
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
    isCpital: field({
      type: Boolean,
      label: 'Is capital',
      required: false,
      default: false
    }),

    searchText: field({ type: String, optional: true, index: true })
  }),
  'mobinet_districts'
);

districtSchema.index({ center: '2dsphere' });
