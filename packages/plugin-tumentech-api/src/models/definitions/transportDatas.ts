import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface ITransportData {
  tid: number;
  from: string;
  to: string;
  payloadtype: string;
  weight: string;
  payloadsize: number;
  trantype: string;
  vehicletype: string;
  trunktype: string;
  tran_start_dt: string;
  year: number;
  month: number;
  week: number;
  day: number;

  range: string;
}

export interface ITransportDataDocument extends ITransportData, Document {
  _id: string;
}

export const transportSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    tid: field({
      type: Number,
      label: 'Transport Id',
      required: true,
      unique: true,
      index: true
    }),
    from: field({ type: String, label: 'From', optional: true }),
    to: field({ type: String, label: 'To', optional: true }),
    payloadtype: field({ type: String, label: 'Payload Type', optional: true }),
    weight: field({ type: String, label: 'Weight', optional: true }),
    payloadsize: field({ type: String, label: 'Payload Size', optional: true }),
    trantype: field({ type: String, label: 'Transport Type', optional: true }),
    vehicletype: field({ type: String, label: 'Vehicle Type', optional: true }),
    trunktype: field({ type: String, label: 'Trunk Type', optional: true }),
    tran_start_dt: field({
      type: String,
      label: 'Transport Start Date',
      optional: true
    }),
    year: field({ type: Number, label: 'Year', optional: true }),
    month: field({ type: Number, label: 'Month', optional: true }),
    week: field({ type: Number, label: 'Week', optional: true }),
    day: field({ type: Number, label: 'Day', optional: true }),
    range: field({ type: String, label: 'Range', required: true })
  }),
  'tumentech_transports'
);

transportSchema.index({ tid: 1 });
