import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IActive {
  username: string;
  email: string;
  employeeId: string;
}

export interface IActiveDocument extends IActive, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const activeSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),

    createdAt: field({ type: Date, label: 'Created at' }),

    modifiedAt: field({ type: Date, label: 'Modified at' }),

    ownerId: field({ type: String, optional: true, label: 'Owner' }),

    plateNumber: field({
      type: String,
      optional: true,
      label: 'Plate number',
      index: true,
    }),
  })
);
