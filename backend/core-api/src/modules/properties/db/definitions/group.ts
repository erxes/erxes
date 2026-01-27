import { Schema } from 'mongoose';

export const logicSchema = new Schema({
  field: { type: String, label: 'Field' },
  operator: { type: String, label: 'Logic Operator' },
  value: { type: String, label: 'Logic Value' },
  action: { type: String, label: 'Logic Action' },
}, { _id: false })

export const fieldGroupSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    code: { type: String, label: 'Code', required: true, index: true },
    description: { type: String, label: 'Description' },
    contentType: { type: String, label: 'Content type' },

    order: { type: Number, label: 'Order', index: true },

    logics: { type: [logicSchema], label: 'Logic' },
    configs: { type: Schema.Types.Mixed, label: 'Configs' },

    createdBy: { type: String, label: 'Created By' },
    updatedBy: { type: String, label: 'Updated By' },
  },
  { timestamps: true },
);
