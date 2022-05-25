import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IRoute {
  staticRouteId: string;
  order: number;
}

export interface IRouteOption {
  name: string;
  routes: IRoute[];
}

export interface IRouteOptionDocument extends IRouteOption, Document {
  _id: string;
}

export const routeOptionsSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Route name', required: true }),
    routes: field({
      type: [Schema.Types.Mixed],
      label: 'routes',
      required: true
    })
  }),
  'erxes_route_options'
);
