import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';

export const couponSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name' },
    },
    {
      timestamps: true,
    },
  ),
);
