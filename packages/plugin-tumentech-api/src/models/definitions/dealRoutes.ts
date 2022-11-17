import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface IDealRoute {
  dealId: string;
  routeId: string;
  reversed: boolean;
}

export interface IDealRouteDocument extends IDealRoute, Document {
  _id: string;
}

export const dealRouteSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    dealId: field({ type: String, label: 'Deal Id', required: true }),
    reversed: field({ type: Boolean, label: 'Reversed', default: false }),
    routeId: field({
      type: String,
      label: 'Route Id',
      required: true
    })
  }),
  'deal_routes'
);

dealRouteSchema.index({ dealId: 1, routeId: 1 });
