import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const loyaltyConfigSchema = schemaWrapper(
  new Schema({
    code: { type: String, unique: true },
    value: { type: Schema.Types.Mixed },
  }),
);
