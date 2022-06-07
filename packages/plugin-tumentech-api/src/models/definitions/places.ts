import { ILocationOption } from '@erxes/ui/src/types';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IPlace {
  name: string;
  code: string;
  province: string;
  center: ILocationOption;
}

export interface IPlaceDocument extends IPlace, Document {
  _id: string;
}

export interface IPlaceEdit extends IPlace {
  _id: string;
}

export const placeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'code', required: false }),
    name: field({ type: String, label: 'name', required: true }),
    province: field({
      type: String,
      label: 'Province',
      required: true
    }),
    center: field({
      type: Schema.Types.Mixed,
      label: 'Center location',
      required: true
    }),

    searchText: field({ type: String, optional: true, index: true })
  }),
  'places'
);
