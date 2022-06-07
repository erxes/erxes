import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITrip {
  driverId: string;
  carId: string;
  dealIds: string[];
  routeId: string;
  createdAt: Date;
  startedDate: Date;
  estimatedCloseDate: Date;
  closedDate: Date;
  status: string;
  statusDates: [{ [key: string]: Date }];
  trackingHistory: [[number, number, number]];
}

export interface ITripDocument extends ITrip, Document {
  _id: string;
}

export const tripSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    driverId: field({ type: String, label: 'Driver id' }),
    carId: field({ type: String, label: 'Car id' }),
    dealIds: field({ type: [String], label: 'Deal ids' }),
    routeId: field({ type: String, label: 'Route id' }),
    createdAt: field({ type: Date, label: 'Created at', default: new Date() }),
    startedDate: field({ type: Date, label: 'Started at', optional: true }),
    estimatedCloseDate: field({
      type: Date,
      label: 'Estimated close date',
      optional: true
    }),
    closedDate: field({ type: Date, label: 'Closed at', optional: true }),
    status: field({ type: String, label: 'Status' }),
    statusDates: field({ type: [Schema.Types.Mixed], label: 'status dates' }),
    trackingHistory: field({ type: [[Number]], label: 'tracking history' })
  }),
  'trips'
);
