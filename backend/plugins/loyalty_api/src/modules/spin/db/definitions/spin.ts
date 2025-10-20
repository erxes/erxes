import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';

export const spinSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name' },
    },
    {
      timestamps: true,
    },
  ),
);
