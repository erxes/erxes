import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

//  zamiin suljeenii chigelliin dugaar , awto zamiin chigleliin dugaar , awto zamin dugaar, zamiin ner

export interface IDirection {
  placeIds: [string, string];
  routeCode: string;
  roadCode: string;
  totalDistance: number;
  roadConditions: string[];
  duration: number;
  googleMapPath?: string;
}

export interface IDirectionDocument extends IDirection, Document {
  _id: string;
}

export const directionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    placeIds: field({ type: [String], label: 'place ids', required: true }),
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
    duration: field({ type: Number, label: 'total duration (minuts)' }),
    routeCode: field({ type: String, label: 'route code' }),
    roadCode: field({ type: String, label: 'road code' }),
    googleMapPath: field({ type: String, label: 'Google map path' }),
    searchText: field({ type: String, optional: true, index: true })
  }),
  'directions'
);
