import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const workflowRunSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    workflowId: { type: String, index: true, label: 'Workflow' },
    version: { type: Number, label: 'Definition version' },
    // Mastra's runId — the key for snapshot rehydration (suspend/resume).
    runId: { type: String, index: true, label: 'Mastra run id' },
    status: {
      type: String,
      enum: ['running', 'suspended', 'success', 'failed', 'canceled'],
      index: true,
      label: 'Status',
    },
    triggerEnvelope: { type: Object, label: 'Trigger envelope' },
    // Frozen copy of the definition this run executes — survives later edits.
    definitionSnapshot: { type: Object, label: 'Definition snapshot' },
    stepsSummary: { type: Object, label: 'Per-step results' },
    output: { type: Object, label: 'Final output' },
    error: { type: String, label: 'Error' },
    usage: { type: Object, label: 'Usage' },
    startedAt: { type: Date, label: 'Started' },
    finishedAt: { type: Date, label: 'Finished' },
  },
  { timestamps: true },
);
