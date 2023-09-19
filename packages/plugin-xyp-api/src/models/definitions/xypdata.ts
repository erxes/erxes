import { Schema, Document } from 'mongoose';
import { field } from './utils';
// import { customFieldSchema } from '@erxes/api-utils/src/types';
import {
  ICustomField,
  customFieldSchema
} from '@erxes/api-utils/src/definitions/common';

export interface IXypData {
  contentType: String;
  contentTypeId: String;
  data: ICustomField;

  createdBy: String;
  createdAt: Date;
  updatedBy: String;
  updatedAt: Date;
}
export interface IXypconfigDocument extends IXypData, Document {
  _id: string;
}

export const xypConfigSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({ type: String, label: 'contentType' }),
  contentTypeId: field({ type: String, label: 'contentTypeId' }),

  data: field({
    type: [customFieldSchema],
    optional: true,
    label: 'Xyp Data'
  }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  updatedBy: field({ type: String, label: 'Updated by' }),
  updatedAt: field({ type: Date, label: 'Updated at' })
});
