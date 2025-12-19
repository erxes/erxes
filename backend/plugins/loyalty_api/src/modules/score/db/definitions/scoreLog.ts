import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { SCORE_ACTION } from '../../constants';

export const scoreLogSchema = schemaWrapper(
  new Schema(
    {
      campaignId: { type: String, label: 'Campaign Id', index: true },
      ownerId: { type: String, label: 'User Id', index: true },
      ownerType: { type: String, label: 'User Type', index: true },
      description: { type: String, label: 'Description' },

      action: { type: String, label: 'Action', enum: SCORE_ACTION.ALL },
      change: { type: Number, label: 'Change' },

      contentId: { type: String, label: 'Content Id', index: true },
      contentType: { type: String, label: 'Content Type' },

      createdBy: { type: String, label: 'Created By' },
    },
    {
      timestamps: true,
    },
  ),
);
