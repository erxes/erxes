import { Schema } from "mongoose";

export const logicSchema = new Schema({
  field: { type: String, label: 'Field' },
  operator: { type: String, label: 'Logic Operator' },
  value: { type: String, label: 'Logic Value' },
  action: { type: String, label: 'Logic Action' },
}, { _id: false })