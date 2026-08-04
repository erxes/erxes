import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const bundleConditionsSchema = schemaWrapper(
  new Schema({
    code: { type: String, label: 'Code' },
    name: { type: String, label: 'Name' },
    userId: { type: String, label: 'userId' },
    isDefault: { type: Boolean, label: 'is default' },
    description: {
      type: String,
      optional: true,
      label: 'Description',
    },
  }),
);
