import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { OWNER_TYPES } from '~/constants';

export const scoreLogSchema = schemaWrapper(
  new Schema(
    {
      createdAt: { type: Date, label: 'Created at' },
      createdBy: { type: String, label: 'Created User', optional: true },

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
      changeScore: { type: Number, label: 'Changed Score' },
      description: { type: String, label: 'Description' },
      serviceName: { type: String, label: 'Service name' },
      targetId: { type: String, label: 'Target' },
      action: {
        type: String,
        enum: ['add', 'subtract', 'refund'],
        label: 'Action',
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
  targetId: 1,
  action: 1,
});
