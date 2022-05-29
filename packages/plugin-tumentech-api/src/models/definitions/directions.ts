import { ILocationOption } from '@erxes/ui/src/types';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IPlace {
  name: string;
  code: string;
  center: ILocationOption;
}

export interface IDirection {
  placeA: IPlace;
  placeB: IPlace;
  totalDistance: number;
  roadConditions: string[];
  description: string;
  duration: number;
}

export interface IDirectionDocument extends IDirection, Document {
  _id: string;
}

export const placeSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, label: 'name' },
    code: { type: String, label: 'code' },
    center: { type: Schema.Types.Mixed, label: 'center' }
  },
  { _id: false }
);

export const directionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    locationA: field({ type: placeSchema, label: 'A', required: true }),
    locationB: field({ type: placeSchema, label: 'B', required: true }),
    totalDistance: field({
      type: Number,
      label: 'Total distance',
      required: true
    }),
    roadConditions: field({
      type: [String],
      label: 'Road Condition',
      optional: true
    }),
    description: field({ type: String, label: 'description' }),
    duration: field({ type: Number, label: 'total duration (minuts)' })
  }),
  'static_routes'
);
