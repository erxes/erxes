import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { ACCOUNT_CATEGORY_MASK_TYPES, ACCOUNT_CATEGORY_STATUSES } from '../../@types/constants';

export const accountCategorySchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Name' },
    code: { type: String, unique: true, label: 'Code' },
    order: { type: String, label: 'Order' },
    parentId: { type: String, optional: true, label: 'Parent' },
    description: { type: String, optional: true, label: 'Description' },
    status: {
      type: String,
      enum: ACCOUNT_CATEGORY_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
      label: 'Created at',
    },
    maskType: {
      type: String,
      optional: true,
      label: 'Mask type',
      enum: ACCOUNT_CATEGORY_MASK_TYPES.ALL,
    },
    mask: { type: Object, label: 'Mask', optional: true },
  }),
);
