import {
  mongooseStringRandomId,
  schemaWrapper
} from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { MnConfigCodes } from '../../@types/configs';

// ============= Config Schema =============
export const configSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: { // type
      type: String,
      label: 'Code',
      enum: MnConfigCodes,
      index: true,
    },
    subId: {
      type: String,
      label: 'Sub ID',
      default: '',
    },
    value: {
      type: Object,
      label: 'Value',
    },
  })
);

configSchema.index({ code: 1, subId: 1 }, { unique: true });

export const configs = {
  configSchema
};