import { CODE_STATUS } from '@/coupon/constants';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const usageLogSchema = new Schema(
  {
    usedDate: {
      type: Date,
      default: Date.now,
    },
    ownerId: String,
    ownerType: String,
    targetId: String,
    targetType: String,
  },
  { _id: false },
);

export const couponSchema = schemaWrapper(
  new Schema(
    {
      campaignId: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      usageLimit: {
        type: Number,
        default: 1,
        min: 1,
      },
      usageCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      status: {
        type: String,
        enum: CODE_STATUS.ALL,
        default: CODE_STATUS.NEW,
      },
      usageLogs: {
        type: [usageLogSchema],
        default: [],
      },
      redemptionLimitPerUser: { type: Number, min: 1 },
    },
    {
      timestamps: true,
    },
  ),
);
