import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const tagSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, label: 'Name', unique: true },
      colorCode: { type: String, label: 'Color code' },
      parentId: { type: String, label: 'Parent' },
      relatedIds: { type: [String], label: 'Children tag ids' },
      isGroup: { type: Boolean, label: 'Is group', default: false },
      type: { type: String, label: 'Content type' },
      objectCount: { type: Number, label: 'Object count' },
    },
    {
      timestamps: true,
    },
  ),
);

tagSchema.index({ _id: 1, name: 1, parentId: 1, type: 1 });
