import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { OWNER_TYPES } from '~/constants';

export const scoreLogSchema = schemaWrapper(
  new Schema(
    {
      createdAt: { type: Date, label: 'Created at' },
      createdBy: { type: String, label: 'Created User', optional: true },
      createdVia: { type: Object, label: 'Created via', optional: true },

      ownerType: {
        type: String,
        label: 'Owner Type',
        enum: OWNER_TYPES.ALL,
      },
      campaignId: {
        type: String,
        index: true,
        label: 'Campaign ID',
        optional: true,
      },
      ownerId: { type: String, index: true, label: 'Owner' },
      preScore: { type: Number, label: 'Previous Score', optional: true },
      changeScore: { type: Number, label: 'Changed Score' },
      description: { type: String, label: 'Description' },
      serviceName: { type: String, label: 'Service name' },
      targetId: { type: String, label: 'Target' },
      targetType: { type: String, label: 'Target type', optional: true },
      action: {
        type: String,
        enum: ['add', 'subtract', 'set', 'refund', 'return', 'expire'],
        label: 'Action',
      },
      accountTypeId: { type: String, label: 'Loyalty account type' },
      accountId: { type: String, label: 'Loyalty account' },
      breakdown: {
        type: [
          new Schema(
            {
              rowKey: { type: String },
              name: { type: String },
              points: { type: Number },
            },
            { _id: false },
          ),
        ],
        default: undefined,
        label: 'Earning rows',
      },
      sourceScoreLogId: {
        type: String,
        label: 'Source Score Log',
        optional: true,
      },
    },
    {
      timestamps: true,
    },
  ),
);

scoreLogSchema.index({
  ownerType: 1,
  ownerId: 1,
  createdAt: 1,
  changeScore: 1,
});

scoreLogSchema.index({
  ownerType: 1,
  ownerId: 1,
  createdAt: -1,
});

scoreLogSchema.index({
  campaignId: 1,
  createdAt: -1,
});

scoreLogSchema.index({
  action: 1,
  targetId: 1,
});

scoreLogSchema.index({
  targetId: 1,
  action: 1,
});

// A period reset reads what each account moved since the period began.
scoreLogSchema.index({
  accountId: 1,
  accountTypeId: 1,
  createdAt: 1,
});
