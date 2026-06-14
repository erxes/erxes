import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

// One profile per (resourceId, agentId). Resource-scoped so the agent
// remembers a user across all of their sessions.
export const workingMemorySchema = new Schema({
  _id: mongooseStringRandomId,
  resourceId: { type: String, required: true, label: 'Resource (user) id' },
  agentId: { type: String, required: true, label: 'Agent id' },
  content: { type: String, default: '', label: 'Profile (markdown)' },
  updatedAt: { type: Date, default: Date.now, label: 'Updated at' },
});

workingMemorySchema.index({ resourceId: 1, agentId: 1 }, { unique: true });
