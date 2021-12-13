import { Document, Schema } from 'mongoose';
import { TAG_TYPES } from './constants';
import { field, schemaHooksWrapper } from './utils';

export interface ITag {
  name: string;
  type: string;
  colorCode?: string;
  objectCount?: number;
  parentId?: string;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
  createdAt: Date;
  order?: string;
  relatedIds?: string[];
}

export const tagSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    type: field({
      type: String,
      enum: TAG_TYPES.ALL,
      label: 'Type'
    }),
    colorCode: field({ type: String, label: 'Color code' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    objectCount: field({ type: Number, label: 'Object count' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    relatedIds: field({ type: [String], optional: true, label: 'Childrens' })
  }),
  'erxes_tags'
);

// for tags query. increases search speed, avoids in-memory sorting
tagSchema.index({ type: 1, order: 1, name: 1 });
