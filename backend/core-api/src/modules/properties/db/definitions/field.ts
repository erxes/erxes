import { Schema } from 'mongoose';

export const fieldSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    code: { type: String, label: 'Code', required: true, unique: true, index: true },
    fieldName: { type: String, label: 'Field name', required: true },
    groupId: { type: Schema.Types.ObjectId, label: 'Group ID', required: true, index: true },
    contentType: { type: String, label: 'Content type', required: true },
    contentTypeId: { type: String, label: 'Content type ID', required: true },

    type: { type: String, label: 'Type', required: true },
    order: { type: Number, label: 'Order', index: true },
    isVisible: { type: Boolean, label: 'Is visible', default: true },

    logics: { type: Schema.Types.Mixed, label: 'Logic' },
    validations: { type: Schema.Types.Mixed, label: 'Validation' },

    createdBy: { type: String, label: 'Created By' },
    updatedBy: { type: String, label: 'Updated By' },
  },
  { timestamps: true },
);
