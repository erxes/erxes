import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const productRuleSchema = new Schema({
  _id: mongooseStringRandomId,
  createdAt: { type: Date, label: 'Created at', index: true },
  modifiedAt: { type: Date, label: 'Modified at' },

  title: { type: String, label: 'title' },

  // filters
  productIds: { type: [String], optional: true, label: 'product' },
  productCategoryIds: {
    type: [String],
    optional: true,
    label: 'productCategory',
  },
  excludeCategoryIds: {
    type: [String],
    optional: true,
    label: 'excludeCategory',
  },
  excludeProductIds: {
    type: [String],
    optional: true,
    label: 'excludeProduct',
  },
  tagIds: { type: [String], optional: true, label: 'tag' },
  excludeTagIds: { type: [String], optional: true, label: 'excludeTag' },

  // rules
  kind: { type: String, label: 'kind' }, // vat, ctax
  taxType: { type: String, label: 'taxType', optional: true },
  taxCode: { type: String, label: 'taxCode', optional: true },
  taxPercent: { type: Number, label: 'Percent', optional: true },
});
