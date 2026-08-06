import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { validateCron, validateTimezone } from '@/schedule/cron';

/** Schema-level backstop: returns false instead of letting the check throw. */
const passes = (check: (value: string) => string) => (value: string) => {
  try {
    check(value);
    return true;
  } catch {
    return false;
  }
};

export const scheduleSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    description: { type: String, label: 'Description' },
    agentId: { type: String, required: true, index: true, label: 'Agent' },
    // The model statics validate with specific error messages; these schema
    // validators are a backstop so no write path can store a cron/timezone
    // the reconciler would then log errors about every 5 minutes.
    cron: {
      type: String,
      required: true,
      label: 'Cron expression',
      validate: {
        validator: passes(validateCron),
        message: 'Invalid cron expression',
      },
    },
    timezone: {
      type: String,
      default: 'UTC',
      label: 'Timezone',
      validate: {
        validator: passes(validateTimezone),
        message: 'Unknown timezone',
      },
    },
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
