import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface IRoute {
  name: string;
  code: string;
  directionIds: string[];
}

export interface IRouteDocument extends IRoute, Document {
  _id: string;
}

export const routeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    directionIds: field({
      type: [String],
      label: 'direction ids',
      required: true
    }),
    placeIds: field({ type: [String], label: 'place ids' }),
    code: field({ type: String, label: 'Code' }),
    name: field({ type: String, label: 'Name' }),
    searchText: field({ type: String, optional: true, index: true })
  }),
  'routes'
);
