import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';

export const categorySchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name', required: true },
      code: { type: String, label: 'Code', required: true, unique: true },
      order: { type: String, label: 'Order', required: true },
      parentId: { type: String, label: 'Parent' },
      description: { type: String, label: 'Description' },
      image: { type: attachmentSchema, label: 'Image' },
      secondaryImage: {
        type: [attachmentSchema],
        label: 'Secondary images',
      },
      productCategoryId: { type: String, label: 'Product' },
    },
    {
      timestamps: true,
    },
  ),
);
