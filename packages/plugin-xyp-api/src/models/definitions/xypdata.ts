import { Schema, Document } from 'mongoose';
import { field } from './utils';
// import { customFieldSchema } from '@erxes/api-utils/src/types';
import {
  ICustomField,
  customFieldSchema
} from '@erxes/api-utils/src/definitions/common';

export interface IXypData {
  contentType: string;
  contentTypeId: string;
  data: any;

  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
export interface IXypconfigDocument extends IXypData, Document {
  _id: string;
}

export const xypServiceData = new Schema(
  {
    serviceName: field({ type: String, label: 'name code' }),
    serviceDescription: field({ type: String, label: 'service description' }),
    data: field({
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Xyp Data'
    })
  },
  { _id: false }
);

export const xypDataSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({ type: String, label: 'contentType' }),
  contentTypeId: field({ type: String, label: 'contentTypeId' }),
  data: field({
    type: [xypServiceData],
    optional: true,
    label: 'Xyp Data'
  }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  updatedBy: field({ type: String, label: 'Updated by' }),
  updatedAt: field({ type: Date, label: 'Updated at' })
});
