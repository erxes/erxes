import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const agentActionLogSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    source: {
      type: String,
      enum: ['chat', 'workflow'],
      index: true,
      label: 'Source',
    },
    agentId: { type: String, index: true, label: 'Agent' },
    workflowId: { type: String, index: true, label: 'Workflow' },
    operation: { type: String, index: true, label: 'Operation' },
    operationType: { type: String, label: 'Operation type' },
    destructive: { type: Boolean, default: false, label: 'Destructive' },
    // Stored verbatim so the trail shows exactly what the agent changed.
    args: { type: Schema.Types.Mixed, label: 'Arguments' },
    status: {
      type: String,
      enum: ['success', 'failed', 'blocked'],
      index: true,
      label: 'Status',
    },
    error: { type: String, label: 'Error' },
    // Reserved for revert correlation (Phase 2/3); unset for now.
    userId: { type: String, label: 'User' },
    processId: { type: String, label: 'Process' },
  },
  { timestamps: true, minimize: false },
);

agentActionLogSchema.index({ createdAt: -1 });
