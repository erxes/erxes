import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const agentSkillSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: {
      type: String,
      required: true,
      unique: true,
      label: 'Name (identifier)',
    },
    title: { type: String, required: true, label: 'Title' },
    description: { type: String, required: true, label: 'When to use' },
    body: { type: String, required: true, label: 'Instructions' },
    tags: { type: [String], default: [], label: 'Tags' },
    // Empty = available to every agent; otherwise scoped to these agentIds.
    agentIds: { type: [String], default: [], label: 'Agents' },
    isEnabled: { type: Boolean, default: true, label: 'Enabled' },
    createdByUserId: { type: String, label: 'Created by' },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
);

// The index that powers the per-agent skill lookup (enabled + scope match).
agentSkillSchema.index({ isEnabled: 1, agentIds: 1 });
