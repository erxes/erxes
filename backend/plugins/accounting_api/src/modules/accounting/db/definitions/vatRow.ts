import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { VAT_ROW_STATUS, VatRowKinds } from '../../@types/vatRow';

export const vatRowSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String },
    number: { type: String },
    kind: { type: String, enum: VatRowKinds.ALL },
    formula: { type: String, optional: true },
    formula_text: { type: String, optional: true },
    tabCount: { type: Number, default: 0 },
    isBold: { type: Boolean, default: false },
    status: {
      type: String,
      enum: VAT_ROW_STATUS.ALL,
      label: 'Status',
      default: 'active',
      index: true,
    },
    percent: { type: Number, default: 0 },
  })
);
