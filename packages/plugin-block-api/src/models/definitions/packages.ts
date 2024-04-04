import { Document, Schema } from 'mongoose';
import { PACKAGE_SELECT_OPTIONS } from './constants';
import { field } from './utils';

const getEnum = (fieldName: string): string[] => {
  return PACKAGE_SELECT_OPTIONS[fieldName].map(option => option.value);
};

export interface IPackage {
  name: string;
  description: string;
  wpId: string;
  level: string;
  projectWpId: string;
  projectId: string;
  price: number;
  duration: number;
  profit: number;
}

export interface IPackageDocument extends IPackage, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const packageSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({
    type: String,
    optional: true,
    label: 'Description'
  }),
  wpId: field({ type: String, optional: true, label: 'WP Id' }),
  level: field({
    type: String,
    enum: getEnum('LEVEL'),
    default: '',
    optional: true,
    label: 'Level',
    esType: 'keyword',
    selectOptions: PACKAGE_SELECT_OPTIONS.LEVEL
  }),
  projectWpId: field({
    type: String,
    optional: true,
    label: 'Project WP Id'
  }),
  projectId: field({
    type: String,
    optional: true,
    label: 'Project Id'
  }),
  price: field({ type: Number, optional: true, label: 'Price' }),
  profit: field({ type: Number, optional: true, label: 'Profit' }),
  duration: field({ type: String, optional: true, label: 'Duration' }),
  createdAt: field({
    type: Date,
    default: Date.now,
    label: 'Created at'
  }),
  modifiedAt: field({ type: Date, label: 'Modified at' })
});
