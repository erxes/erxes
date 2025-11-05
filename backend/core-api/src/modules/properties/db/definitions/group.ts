import { Schema } from 'mongoose';

export const fieldGroupSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    code: { type: String, label: 'Code', required: true, index: true },
    description: { type: String, label: 'Description' },
    contentType: { type: String, label: 'Content type' },
    contentTypeId: { type: String, label: 'Content type id' },

    order: { type: Number, label: 'Order', index: true },

    logics: { type: Schema.Types.Mixed, label: 'Logic' },

    createdBy: { type: String, label: 'Created By' },
    updatedBy: { type: String, label: 'Updated By' },
  },
  { timestamps: true },
);
