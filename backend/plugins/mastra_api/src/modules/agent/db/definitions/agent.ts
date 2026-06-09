import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const agentSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    agentId: { type: String, required: true, unique: true, label: 'Agent ID' },
    description: { type: String, label: 'Description' },
    instructions: { type: String, label: 'Instructions' },
    provider: { type: String, required: true, label: 'Provider' },
    model: { type: String, required: true, label: 'Model' },
    toolIds: [{ type: String }],
    memoryEnabled: { type: Boolean, default: true },
    maxSteps: { type: Number, default: 10 },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);
