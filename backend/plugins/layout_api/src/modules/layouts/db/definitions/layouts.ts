import { Schema } from 'mongoose';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const layoutsSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, required: true, label: 'Name' },
      slug: { type: String, required: true, index: true, label: 'Slug' },
      type: {
        type: String,
        enum: ['page', 'dashboard'],
        default: 'page',
        label: 'Layout type',
      },
      config: { type: Schema.Types.Mixed, default: {}, label: 'Layout config' },
      isPublished: { type: Boolean, default: false, label: 'Is published' },
    },
    {
      timestamps: true,
    },
  ),
);
