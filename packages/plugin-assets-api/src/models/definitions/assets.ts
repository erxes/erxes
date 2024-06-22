import {
  attachmentSchema,
  customFieldSchema
} from '@erxes/api-utils/src/types';
import { Schema } from 'mongoose';
import {
  ASSET_CATEGORY_STATUSES,
  ASSET_STATUSES,
  ASSET_KB_ARTICLE_HISTORY_ACTIONS
} from '../../common/constant/asset';
import { field, schemaWrapper } from './utils';

export const assetCategoriesSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    attachment: field({ type: attachmentSchema }),
    status: field({
      type: String,
      enum: ASSET_CATEGORY_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  })
);

export const assetKbArticlesHistoriesSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    assetId: field({ type: String, label: 'Asset Id' }),
    kbArticleId: field({ type: String, label: 'Knowledgebase Article Id' }),
    action: field({
      type: String,
      enum: ASSET_KB_ARTICLE_HISTORY_ACTIONS.ALL,
      required: true
    }),
    userId: field({ type: String, label: 'User Id', required: true }),
    createdAt: field({ type: Date, label: 'Created At', default: new Date() })
  })
);

export const assetSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    categoryId: field({ type: String, optional: true, label: 'Category' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    unitPrice: field({
      type: Number,
      optional: true,
      label: 'Unit price',
      default: 0
    }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    attachment: field({ type: attachmentSchema }),
    attachmentMore: field({ type: [attachmentSchema] }),
    status: field({
      type: String,
      enum: ASSET_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
    vendorId: field({ type: String, optional: true, label: 'Vendor' }),
    mergedIds: field({ type: [String], optional: true }),
    kbArticleIds: field({ type: [String], optional: true })
  })
);
