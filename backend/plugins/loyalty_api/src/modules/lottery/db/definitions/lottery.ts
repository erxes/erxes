import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';

export const lotterySchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name' },
    },
    {
      timestamps: true,
    },
  ),
);
