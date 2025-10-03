import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const tagSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, label: 'Name' },
      type: {
        type: String,
        label: 'Type',
        index: true,
      },
      colorCode: { type: String, label: 'Color code' },
      objectCount: { type: Number, label: 'Object count' },
      order: { type: String, label: 'Order', index: true },
      parentId: {
        type: String,
        optional: true,
        index: true,
        label: 'Parent',
      },
      relatedIds: {
        type: [String],
        optional: true,
        label: 'Children tag ids',
      },
    },
    {
      timestamps: true,
    },
  ),
);

// for tags query. increases search speed, avoids in-memory sorting
tagSchema.index({ _id: 1, type: 1, order: 1, name: 1, createdAt: 1 });
