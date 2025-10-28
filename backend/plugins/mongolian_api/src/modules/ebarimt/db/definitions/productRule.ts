import { Schema, model, Document } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export interface IProductRule {
  _id?: string;
  id?: string;
  title: string;

  // Filters
  productIds?: string[];
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];

  // Rules
  kind: string; // vat, ctax
  taxType?: string;
  taxCode?: string;
  taxPercent?: number;

  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IProductRuleDocument extends Document, IProductRule {
  _id: string;
  id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const productRuleSchema = new Schema<IProductRuleDocument>(
  {
    _id: mongooseStringRandomId,

    id: { type: String, index: true },

    title: { type: String, required: true, label: 'Title' },

    // Filters
    productIds: { type: [String], label: 'Product IDs' },
    productCategoryIds: { type: [String], label: 'Product Category IDs' },
    excludeCategoryIds: { type: [String], label: 'Excluded Category IDs' },
    excludeProductIds: { type: [String], label: 'Excluded Product IDs' },
    tagIds: { type: [String], label: 'Tag IDs' },
    excludeTagIds: { type: [String], label: 'Excluded Tag IDs' },

    // Rules
    kind: { type: String, required: true, label: 'Kind (vat/ctax)' },
    taxType: { type: String, label: 'Tax Type' },
    taxCode: { type: String, label: 'Tax Code' },
    taxPercent: { type: Number, label: 'Tax Percent' },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
    collection: 'erxes_ebarimt',
  }
);

// keep `id` in sync with `_id`
productRuleSchema.pre('save', function (next) {
  if (!this.id) this.id = this._id;
  next();
});

export const ProductRule = model<IProductRuleDocument>('product_rules', productRuleSchema);
