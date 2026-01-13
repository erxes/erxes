import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  ICustomPostTypeDocument,
  ICustomFieldGroupDocument,
} from '@/cms/@types/customPostType';

export const customPostTypeSchema = new Schema<ICustomPostTypeDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },

    label: { type: String, required: true },
    name: { type: String },
    pluralLabel: { type: String, required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true },
);

customPostTypeSchema.index({ name: 1, clientPortalId: 1 }, { unique: true });

export const fieldGroupSchema = new Schema<ICustomFieldGroupDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    label: { type: String, required: true },
    code: { type: String, unique: true },
    parentId: { type: String },
    order: { type: Number },
    customPostTypeIds: { type: [String] },

    enabledPageIds: { type: [String] },
    enabledCategoryIds: { type: [String] },
    type: { type: String, required: true, default: 'user' },
    fields: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true },
);
