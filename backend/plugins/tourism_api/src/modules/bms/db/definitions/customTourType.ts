import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  ICustomTourFieldGroupDocument,
  ICustomTourTypeDocument,
} from '@/bms/@types/customTourType';

export const customTourTypeSchema = new Schema<ICustomTourTypeDocument>(
  {
    _id: mongooseStringRandomId,
    branchId: { type: String, required: true },

    label: { type: String, required: true },
    name: { type: String },
    pluralLabel: { type: String, required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true },
);

customTourTypeSchema.index({ name: 1, branchId: 1 }, { unique: true });

const tourFieldSchema = new Schema({
  _id: mongooseStringRandomId,
  label: { type: String, required: true },
  code: { type: String },
  type: { type: String, required: true, default: 'text' },
  description: { type: String },
  isRequired: { type: Boolean, default: false },
  options: { type: [String] },
});

export const customTourFieldGroupSchema =
  new Schema<ICustomTourFieldGroupDocument>(
    {
      _id: mongooseStringRandomId,
      branchId: { type: String, required: true },
      label: { type: String, required: true },
      code: { type: String },
      parentId: { type: String },
      order: { type: Number },
      customTourTypeIds: { type: [String] },
      enabledTourIds: { type: [String] },
      type: { type: String, required: true, default: 'user' },
      fields: { type: [tourFieldSchema], default: [] },
    },
    { timestamps: true },
  );

customTourFieldGroupSchema.index(
  { code: 1, branchId: 1 },
  { unique: true, sparse: true },
);
