import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IEntryValue {
  fieldCode: string;
  value: any;
}

export interface IEntry {
  contentTypeId: string;
  values: IEntryValue[];

  createdBy?: string;
  modifiedBy?: string;
}

export interface IEntryDocument extends IEntry, Document {
  _id: string;

  createdAt: Date;
  modifiedAt: Date;
}

export const valueSchema = new Schema(
  {
    fieldCode: field({ type: String, label: 'Field code' }),
    value: field({ type: 'Mixed', label: 'Value' })
  },
  { _id: false }
);

export const entrySchema = new Schema({
  contentTypeId: field({ type: String, label: 'Content type' }),
  values: field({ type: [valueSchema], label: 'Values' }),

  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  modifiedBy: field({ type: String, optional: true, label: 'Modified by' }),

  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' })
});
