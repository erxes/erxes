import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const statusSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true },
    description: { type: String },

    pipelineId: { type: String, required: true, index: true },

    color: { type: String, default: '#4F46E5' },

    type: { type: Number, required: true },
    order: { type: Number, required: true },

    visibilityType: { type: String },
    memberIds: [{ type: String }],
    canMoveMemberIds: [{ type: String }],
    canEditMemberIds: [{ type: String }],
    departmentIds: [{ type: String }],

    state: { type: String },
    probability: { type: Number },
  },
  {
    timestamps: true,
  },
);
