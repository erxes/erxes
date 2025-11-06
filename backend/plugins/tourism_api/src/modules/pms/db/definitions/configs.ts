import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const configSchema = new Schema({
  _id: mongooseStringRandomId,
  code: { type: String, unique: true, label: 'Code' },
  value: { type: Object, label: 'Value' },
  pipelineId: { type: String, label: 'pipelineId' },
});
