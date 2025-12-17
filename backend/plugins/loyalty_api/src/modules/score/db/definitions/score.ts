import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';

export const scoreSchema = schemaWrapper(
  new Schema(
    {
      ownerId: { type: String, label: 'User Id', index: true, unique: true },
      ownerType: { type: String, label: 'User Type', index: true },
      score: { type: Number, label: 'Score', default: 0 },
    },
    {
      timestamps: true,
    },
  ),
);
