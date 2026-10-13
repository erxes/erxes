import { Schema } from "mongoose";

export const featuredOwnerSchema = new Schema(
  {
    plugin: { type: String, required: true },
    module: { type: String, required: true },
    refId: { type: String },
    key: { type: String, required: true },
    status: { type: String, enum: ['active', 'orphaned', 'archived'] },
  },
  { _id: false },
);

export const logicSchema = new Schema({
  field: { type: String, label: 'Field' },
  operator: { type: String, label: 'Logic Operator' },
  value: { type: String, label: 'Logic Value' },
  action: { type: String, label: 'Logic Action' },
}, { _id: false })