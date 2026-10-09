import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { LOYALTY_RULE_TYPE_VALUES } from '../../utils/loyaltyRules';

const placeSchema = new Schema(
  {
    probability: { type: String, label: 'Probability' },
    stageIds: { type: [String], label: 'Stages' },
  },
  { _id: false },
);

// Where deals earn and give back a score campaign's points.
export const loyaltyRuleSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    type: {
      type: String,
      enum: LOYALTY_RULE_TYPE_VALUES,
      required: true,
      label: 'Type',
    },
    scoreCampaignId: { type: String, required: true, label: 'Score campaign' },
    boardId: { type: String, label: 'Board' },
    pipelineId: { type: String, label: 'Pipeline' },
    earn: { type: placeSchema, label: 'Earn at' },
    refund: { type: placeSchema, label: 'Refund at' },
    createdBy: { type: String, label: 'Created by' },
    updatedBy: { type: String, label: 'Updated by' },
  },
  { timestamps: true },
);

export const tierBandSchema = new Schema(
  {
    tier: { type: String, required: true, label: 'Tier' },
    min: { type: Number, label: 'From' },
    max: { type: Number, label: 'To' },
  },
  { _id: false },
);

// Where deals set a wallet's tier by the purchase amount.
export const loyaltyTierRuleSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    type: {
      type: String,
      enum: LOYALTY_RULE_TYPE_VALUES,
      required: true,
      label: 'Type',
    },
    accountTypeId: { type: String, required: true, label: 'Wallet' },
    bands: { type: [tierBandSchema], label: 'Bands' },
    onlyUpgrade: { type: Boolean, label: 'Only upgrade' },
    boardId: { type: String, label: 'Board' },
    pipelineId: { type: String, label: 'Pipeline' },
    earn: { type: placeSchema, label: 'Set at' },
    createdBy: { type: String, label: 'Created by' },
    updatedBy: { type: String, label: 'Updated by' },
  },
  { timestamps: true },
);
