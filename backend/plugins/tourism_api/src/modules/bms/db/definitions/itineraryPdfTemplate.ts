import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const itineraryPdfTemplateSchema = new Schema({
  _id: mongooseStringRandomId,
  itineraryId: { type: String, required: true, label: 'itineraryId' },
  branchId: { type: String, optional: true, label: 'branchId' },
  kind: {
    type: String,
    required: true,
    default: 'custom-builder',
    label: 'kind',
  },
  name: { type: String, optional: true, label: 'name' },
  description: { type: String, optional: true, label: 'description' },
  status: { type: String, optional: true, label: 'status' },
  version: { type: Number, optional: true, default: 1, label: 'version' },
  doc: { type: Schema.Types.Mixed, required: true, label: 'doc' },
  createdBy: { type: String, optional: true, label: 'createdBy' },
  modifiedBy: { type: String, optional: true, label: 'modifiedBy' },
  createdAt: { type: Date, label: 'Created at' },
  modifiedAt: { type: Date, label: 'Modified at' },
});

itineraryPdfTemplateSchema.index(
  { itineraryId: 1, kind: 1 },
  { unique: true, sparse: true },
);
