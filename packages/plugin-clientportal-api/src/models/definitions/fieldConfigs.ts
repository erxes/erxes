import { field } from '@erxes/api-utils/src';
import { Document, Schema } from 'mongoose';

export interface IFieldConfig {
  fieldId: string;
  allowedClientPortalIds: string[];
  requiredOn: string[];
}

export interface IFieldConfigDocument extends IFieldConfig, Document {
  _id: string;
  createdAt?: Date;
}

export const fieldConfigSchema = new Schema({
  fieldId: field({
    type: String,
    required: true,
    unique: true,
    label: 'Field id'
  }),
  allowedClientPortalIds: field({
    type: [String],
    default: [],
    label: 'Allowed clientportal ids'
  }),
  requiredOn: field({
    type: [String],
    default: [],
    label: 'Required on clientportal ids'
  })
});
