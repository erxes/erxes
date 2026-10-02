import { SCORE_CAMPAIGN_STATUSES } from '@/score/constants';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const addSchema = new Schema(
  { table: { type: Schema.Types.Mixed, label: 'Earning table' } },
  { _id: false },
);

const subtractSchema = new Schema(
  { rules: { type: Schema.Types.Mixed, label: 'Spending rules' } },
  { _id: false },
);

export const scoreCampaignSchema = schemaWrapper(
  new Schema(
    {
      title: { type: String, label: 'Campaign Title' },
      description: { type: String, label: 'Campaign Description' },
      order: { type: Number, label: 'Sort Order', index: true },
      add: { type: addSchema, label: 'Earning' },
      subtract: { type: subtractSchema, label: 'Spending' },
      createdAt: { type: Date, label: 'Created At', default: new Date() },
      createdUserId: { type: String, label: 'Created User Id' },
      ownerType: { type: String, label: 'Owner Type' },
      accountTypeId: {
        type: String,
        label: 'Loyalty account type',
        index: true,
      },
      fieldId: { type: String, label: 'Field Id' },
      status: {
        type: String,
        enum: Object.values(SCORE_CAMPAIGN_STATUSES),
        default: SCORE_CAMPAIGN_STATUSES.DRAFT,
      },
      serviceName: {
        type: String,
        label: 'Service Name',
        optional: true,
      },
      additionalConfig: {
        type: Schema.Types.Mixed,
        label: 'Additional Config',
        optional: true,
      },

      restrictions: {
        type: Schema.Types.Mixed,
        label: 'Restrictions',
        optional: true,
      },
    },
    {
      timestamps: true,
    },
  ),
);
