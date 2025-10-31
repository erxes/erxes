import { Schema, Document } from 'mongoose';
import { commonCampaignSchema } from './common';

export const couponCampaignSchema = new Schema({
  ...commonCampaignSchema,

  kind: {
    type: String,
    enum: ['amount', 'percent'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  codeRule: {
    type: Schema.Types.Mixed,
  },
  restrictions: {
    type: Schema.Types.Mixed,
  },
  redemptionLimitPerUser: { type: Number, min: 1, default: 1 },

  buyScore: { type: Number, min: 0 },
});
