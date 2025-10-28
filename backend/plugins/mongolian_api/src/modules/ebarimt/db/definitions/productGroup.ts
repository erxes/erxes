import { Schema, model, Document } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export interface IProductGroup {
  _id?: string;
  id?: string;
  mainProductId: string;
  subProductId: string;
  sortNum: number;
  ratio?: number;
  isActive: boolean;
  modifiedBy?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IProductGroupDocument extends Document, IProductGroup {
  _id: string;
  id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const productGroupSchema = new Schema<IProductGroupDocument>(
  {
    _id: mongooseStringRandomId,

    id: { type: String, index: true }, // keeps a duplicate for client-side or GraphQL use
    mainProductId: { type: String, required: true, unique: true, label: 'Main Product' },
    subProductId: { type: String, required: true, label: 'Sub Product' },
    sortNum: { type: Number, default: 1, label: 'Sort Number' },
    ratio: { type: Number, label: 'Ratio' },
    isActive: { type: Boolean, default: true, label: 'Is Active' },
    modifiedBy: { type: String, label: 'Modified User' },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
    collection: 'erxes_ebarimt',
  }
);

// keep `id` in sync with `_id`
productGroupSchema.pre('save', function (next) {
  if (!this.id) this.id = this._id;
  next();
});

export const ProductGroup = model<IProductGroupDocument>('product_groups', productGroupSchema);
