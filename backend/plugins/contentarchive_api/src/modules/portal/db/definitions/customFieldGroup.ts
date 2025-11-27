import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { ICustomFieldGroupDocument } from '@/portal/@types/customFieldGroup';

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
  },
  { timestamps: true },
);
