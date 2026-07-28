import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { PACKAGE_STATUSES } from '@/products/constants';
import { IPackageDocument } from '@/products/@types/package';

const packageProductSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false },
);

export const packageSchema = schemaWrapper(
  new Schema<IPackageDocument>(
    {
      name: { type: String, label: 'Name' },
      description: { type: String, optional: true, label: 'Description' },
      coverImage: { type: String, optional: true, label: 'Cover image' },
      products: {
        type: [packageProductSchema],
        default: [],
        label: 'Products',
      },
      tagIds: { type: [String], optional: true, label: 'Tags' },
      price: { type: Number, optional: true, label: 'Price' },
      percent: { type: Number, optional: true, min: 0, max: 100, label: 'Discount percent' },
      status: {
        type: String,
        enum: PACKAGE_STATUSES.ALL,
        default: PACKAGE_STATUSES.ACTIVE,
        label: 'Status',
        index: true,
      },
    },
    { timestamps: true },
  ),
);
