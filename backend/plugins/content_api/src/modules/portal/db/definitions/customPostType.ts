import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { ICustomPostTypeDocument } from '@/portal/@types/customPostType';

export const customPostTypeSchema = new Schema<ICustomPostTypeDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },

    label: { type: String, required: true },
    pluralLabel: { type: String, required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true },
);

customPostTypeSchema.index({ name: 1, clientPortalId: 1 }, { unique: true });
