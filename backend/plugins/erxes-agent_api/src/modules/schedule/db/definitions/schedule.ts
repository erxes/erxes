import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const scheduleSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    description: { type: String, label: 'Description' },
    agentId: { type: String, required: true, index: true, label: 'Agent' },
    cron: { type: String, required: true, label: 'Cron expression' },
    timezone: { type: String, default: 'UTC', label: 'Timezone' },
    prompt: { type: String, required: true, label: 'Prompt' },
    // Disabled by default: a schedule only fires after an explicit enable
    // (Run now is allowed regardless, for testing).
    isEnabled: { type: Boolean, default: false, index: true, label: 'Enabled' },
    createdByUserId: { type: String, label: 'Created by' },
    lastRunAt: { type: Date, label: 'Last run' },
    lastStatus: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
      label: 'Last status',
    },
    lastError: { type: String, label: 'Last error' },
    lastReply: { type: String, label: 'Last reply' },
    lastDurationMs: { type: Number, label: 'Last duration (ms)' },
    runCount: { type: Number, default: 0, label: 'Run count' },
  },
  { timestamps: true },
);
