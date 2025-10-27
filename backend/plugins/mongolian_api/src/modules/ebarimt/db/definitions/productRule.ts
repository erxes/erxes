import { Schema, model, Document } from 'mongoose';

export interface IProductRule {
  title: string;

  // filters
  productIds?: string[];
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];

  // rules
  kind: string; // vat, ctax

  // vat
  taxType?: string;
  taxCode?: string;
  taxPercent?: number;
}

export interface IProductRuleDocument extends Document, IProductRule {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

// ✅ Clean Mongoose schema, no subdomain, no wrapper
const ProductRuleSchema = new Schema<IProductRuleDocument>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },

    // filters
    productIds: [{ type: String }],
    productCategoryIds: [{ type: String }],
    excludeCategoryIds: [{ type: String }],
    excludeProductIds: [{ type: String }],
    tagIds: [{ type: String }],
    excludeTagIds: [{ type: String }],

    // rule details
    kind: { type: String, required: true }, // vat, ctax
    taxType: { type: String },
    taxCode: { type: String },
    taxPercent: { type: Number },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  }
);

// ✅ No schemaHooksWrapper, no subdomain prefix, single global model
export const ProductRule = model<IProductRuleDocument>('product_rules', ProductRuleSchema);
