import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface IRoute {
  name: string;
  code: string;
  placeName: string;
  secondaryPlaceName: string;
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
    code: field({ type: String, label: 'Code' }),
    name: field({ type: String, label: 'Name' }),
    placeName: field({ type: String, label: 'Place name' }),
    secondaryPlaceName: field({ type: String, label: 'Secondary place name' }),
    searchText: field({ type: String, optional: true, index: true })
  }),
  'routes'
);
