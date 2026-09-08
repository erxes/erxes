import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const hrmConfigSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: {
      type: String,
      label: 'Code',
      index: true,
      required: true,
    },
    subId: {
      type: String,
      label: 'Sub ID',
      default: '',
    },
    value: {
      type: Schema.Types.Mixed,
      label: 'Value',
    },
  }),
);

hrmConfigSchema.index({ code: 1, subId: 1 }, { unique: true });
