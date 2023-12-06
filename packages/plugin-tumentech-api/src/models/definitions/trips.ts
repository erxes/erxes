import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface ITrackingItem {
  lat: number;
  lng: number;
  trackedDate: Date;
}

export interface ITrip {
  driverId: string;
  carIds: string[];
  dealIds: string[];
  customerIds: string[];
  routeId: string;
  routeReversed: boolean;
  createdAt: Date;
  startedDate: Date;
  estimatedCloseDate: Date;
  closedDate: Date;
  status: string;
  statusInfo: [{ [key: string]: Date }];
  trackingData: ITrackingItem[];
  path: string;
}

export interface ITracking {
  trackingData: ITrackingItem[];
  dealId: string;
  carId: string;
  path?: string;
}

export interface ITripDocument extends ITrip, Document {
  _id: string;
}

export const tripSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    driverId: field({ type: String, label: 'Driver id' }),
    carIds: field({ type: [String], label: 'Car ids' }),
    dealIds: field({ type: [String], label: 'Deal ids' }),
    routeId: field({ type: String, label: 'Route id' }),
    routeReversed: field({ type: Boolean, label: 'Route reversed' }),
    createdAt: field({ type: Date, label: 'Created at', default: Date.now }),
    startedDate: field({ type: Date, label: 'Started at', optional: true }),
    estimatedCloseDate: field({
      type: Date,
      label: 'Estimated close date',
      optional: true
    }),
    closedDate: field({ type: Date, label: 'Closed at', optional: true }),
    status: field({ type: String, label: 'Status', default: 'open' }),
    statusInfo: field({ type: [Schema.Types.Mixed], label: 'status info' }),
    trackingData: field({ type: [[Number]], label: 'tracking history' }),
    customerIds: field({ type: [String], label: 'Customer ids' }),
    path: field({ type: String, label: 'Path' })
  }),
  'trips'
);

export const trackingSchema = schemaHooksWrapper(
  new Schema({
    trackingData: field({ type: [[Number]], label: 'tracking history' }),
    dealId: field({ type: String, label: 'Deal id' }),
    carId: field({ type: String, label: 'Car id' }),
    path: field({ type: String, label: 'Path' })
  }),
  'tumentech_tracking'
);
