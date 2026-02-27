import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const topicSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String },
    description: { type: String },
    brandId: { type: String },
    categoryIds: { type: [String] },
    color: { type: String },
    backgroundImage: { type: String },
    languageCode: { type: String },
    notificationSegmentId: { type: String },

    // Common fields
    createdBy: { type: String },
    modifiedBy: { type: String },
    modifiedDate: { type: Date },
    title: { type: String, required: true },
    code: { type: String },
  },
  {
    timestamps: true,
  },
);

topicSchema.index(
  { code: 1, clientPortalId: 1 },
  { unique: true, sparse: true },
);
