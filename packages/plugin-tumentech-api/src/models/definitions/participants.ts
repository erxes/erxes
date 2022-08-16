import { Document, Schema } from 'mongoose';

import { PARTICIPATION_STATUSES } from '../../constants';
import { field, schemaHooksWrapper } from './utils';

export interface IParticipant {
  routeId: string;
  carIds: string[];
  driverId: string;
  dealId: string;
  status?: string;
  detail?: any;
}

export interface IParticipantDocument extends IParticipant, Document {
  _id: string;
  createdAt: Date;
}

export const participantSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    routeId: field({ type: String, label: 'Route Id', required: true }),
    dealId: field({ type: String, label: 'Deal Id', required: true }),
    carIds: field({ type: [String], label: 'Car Id', required: true }),
    driverId: field({ type: String, label: 'Driver Id', required: true }),
    status: field({
      type: String,
      label: 'Status',
      enum: PARTICIPATION_STATUSES.ALL,
      default: 'participating',
      required: true
    }),
    detail: field({
      type: Schema.Types.Mixed,
      label: 'Detail',
      optional: true,
      default: { price: 0 }
    }),
    createdAt: field({ type: Date, label: 'Created at' })
  }),
  'erxes_participants'
);

// for tags query. increases search speed, avoids in-memory sorting
participantSchema.index({ customerId: 1, dealId: 1 });
