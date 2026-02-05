import { SCORE_CAMPAIGN_STATUSES } from '@/score/constants';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const addSchema = new Schema(
  {
    placeholder: { type: String, label: 'Placeholder' },
    currencyRatio: { type: String, label: 'currencyRatio', default: 1 },
  },
  { _id: false },
);

const subtractSchema = new Schema(
  {
    placeholder: { type: String, label: 'Placeholder' },
    currencyRatio: { type: String, label: 'currencyRatio', default: 1 },
  },
  { _id: false },
);

export const scoreCampaignSchema = schemaWrapper(
  new Schema(
    {
      title: { type: String, label: 'Campaign Title' },
      description: { type: String, label: 'Campaign Description' },
      add: { type: addSchema, label: 'Add config' },
      subtract: { type: subtractSchema, label: 'Subtract config' },
      createdAt: { type: Date, label: 'Created At', default: new Date() },
      createdUserId: { type: String, label: 'Created User Id' },
      ownerType: { type: String, label: 'Owner Type' },
      fieldGroupId: { type: String, label: 'Field Group' },
      fieldName: { type: String, label: 'Field Name', optional: true },
      fieldId: { type: String, label: 'Field Id' },
      status: {
        type: String,
        enum: Object.values(SCORE_CAMPAIGN_STATUSES),
        default: SCORE_CAMPAIGN_STATUSES.DRAFT,
      },
      serviceName: {
        type: String,
        label: 'Service Name',
        required: true,
      },
      additionalConfig: {
        type: Schema.Types.Mixed,
        label: 'Additional Config',
        optional: true,
      },

      onlyClientPortal: {
        type: Boolean,
        label: 'Only Client Portal',
        optional: true,
      },

      restrictions: {
        type: Schema.Types.Mixed,
        label: 'Restrictions',
        optional: true,
      },
      fieldOrigin: {
        type: String,
        enum: ['exists', 'new'],
        label: 'Field Origin',
      },
    },
    {
      timestamps: true,
    },
  ),
);
