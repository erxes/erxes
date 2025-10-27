import { Schema, model, Document } from 'mongoose';

export interface IProductGroup {
  mainProductId: string;
  subProductId: string;
  sortNum: number;
  ratio?: number;
  isActive: boolean;
  modifiedBy?: string;
}

export interface IProductGroupDocument extends Document, IProductGroup {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

const ProductGroupSchema = new Schema<IProductGroupDocument>(
  {
    mainProductId: { type: String, required: true, unique: true },
    subProductId: { type: String, required: true },
    sortNum: { type: Number, default: 1 },
    ratio: { type: Number },
    isActive: { type: Boolean, default: true },
    modifiedBy: { type: String },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
    collection: 'erxes_ebarimt_product_groups',
  }
);

export const ProductGroupModel = model<IProductGroupDocument>(
  'ProductGroup',
  ProductGroupSchema
);
