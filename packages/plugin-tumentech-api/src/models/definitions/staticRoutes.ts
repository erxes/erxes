import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IStaticRoute {
  locationA: string;
  locationB: string;
  totalDistance: number;
  dirtRoadLength: number;
  asphaltRoadLength: number;
  description: string;
  duration: number;
}

export interface IStaticRouteDocument extends IStaticRoute, Document {
  _id: string;
}

export const staticRouteSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    locationA: field({ type: String, label: 'from', required: true }),
    locationB: field({ type: String, label: 'to', required: true }),
    totalDistance: field({
      type: Number,
      label: 'Total distance',
      required: true
    }),
    dirtRoadLength: field({
      type: Number,
      label: 'Dirt road total length',
      optional: true,
      default: 0
    }),
    asphaltRoadLength: field({
      type: Number,
      label: 'Asphalt road total length',
      optional: true,
      default: 0
    }),
    description: field({ type: String, label: 'description' }),
    duration: field({ type: Number, label: 'total duration (minuts)' })
  }),
  'static_routes'
);
