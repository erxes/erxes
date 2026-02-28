import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const ticketPipelineSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true },
    userId: { type: String },
    description: { type: String },
    channelId: {
      type: String,
      ref: 'channels',
      required: true,
      index: true,
    },
    order: { type: Number, default: 0 },
    state: { type: String },
    isCheckDate: { type: Boolean },
    isCheckUser: { type: Boolean },
    isCheckDepartment: { type: Boolean },
    isCheckBranch: { type: Boolean },
    isHideName: { type: Boolean },
    excludeCheckUserIds: [{ type: String }],
    numberConfig: { type: String },
    numberSize: { type: String },
    nameConfig: { type: String },
    lastNum: { type: String },
    departmentIds: [{ type: String }],
    branchIds: [{ type: String }],
    tagId: { type: String },
    visibility: { type: String },
    memberIds: [{ type: String }],
  },
  {
    timestamps: true,
  },
);
