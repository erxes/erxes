import {
  mongooseStringRandomId,
  schemaWrapper
} from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

// ============= Config Schema =============
export const configSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: {
      type: String,
      label: 'Code',
      index: true,
    },
    value: {
      type: Object,
      label: 'Value',
    },
  })
);

export const configs = {
  configSchema
};