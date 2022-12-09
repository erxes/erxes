import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface IBuilding {
  name: string;
  code: string;
  description: string;
  type: string;
  osmbId: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLong: number;
    maxLong: number;
  };

  location: {
    lat: number;
    long: number;
  };

  customerIds: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IBuildingDocument extends IBuilding, Document {
  _id: string;
}

export interface IBuildingEdit extends IBuilding {
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
