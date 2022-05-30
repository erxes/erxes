import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IDirectionItem {
  directionId: string;
  order: number;
}

export interface IRoute {
  name: string;
  code: string;
  directions: IDirectionItem[];
}

export interface IRouteDocument extends IRoute, Document {
  _id: string;
}

export const routeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Route name', required: true }),
    directions: field({
      type: [Schema.Types.Mixed],
      label: 'directions',
      required: true
    }),
    code: field({ type: String, label: 'Code' })
  }),
  'routes'
);
