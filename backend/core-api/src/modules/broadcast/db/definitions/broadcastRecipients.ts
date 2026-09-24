import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const BROADCAST_RECIPIENT_STATUSES = [
  'pending',
  'claimed',
  'sent',
  'skipped',
  'failed',
  'missing',
] as const;

export const broadcastRecipientSchema = new Schema({
  _id: mongooseStringRandomId,

  runId: { type: String, label: 'Run', index: true },
  // Denormalized so a question about the campaign never has to join runs.
  engageMessageId: { type: String, label: 'Campaign' },
  // Carried from the run so a row finds its execution without a join.
  automationId: { type: String, optional: true, label: 'Workflow' },
  customerId: { type: String, label: 'Customer' },

  status: {
    type: String,
    enum: BROADCAST_RECIPIENT_STATUSES,
    default: 'pending',
    label: 'Status',
  },
  reason: { type: String, optional: true, label: 'Why it was not sent' },

  claimToken: { type: String, optional: true, label: 'Claim token' },
  claimedUntil: { type: Date, optional: true, label: 'Claim expires at' },
  attempts: { type: Number, default: 0, label: 'Attempts' },

  executionId: { type: String, optional: true, label: 'Automation execution' },
  finishedAt: { type: Date, optional: true, label: 'Finished at' },
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
  // Enrolled, then whenever the row reached an outcome: one field the list
  // orders, shows and filters by.
  updatedAt: { type: Date, default: Date.now, label: 'Updated at' },
});

// One person, one row per run: a relaunch cannot double-send inside a run.
broadcastRecipientSchema.index({ runId: 1, customerId: 1 }, { unique: true });

// The claim query, and the list's own default order.
broadcastRecipientSchema.index({ runId: 1, status: 1 });
broadcastRecipientSchema.index({ runId: 1, updatedAt: -1 });

// A campaign's rows, for the detail view and for clearing up after it.
broadcastRecipientSchema.index({ engageMessageId: 1 });

/**
 * How long a manifest is kept.
 *
 * Zero, and nothing expires — what it was before this could be set, and what
 * it stays until somebody chooses otherwise. "Whether this person has been
 * reached" lives in `broadcast_reached` now, so a window here throws away
 * history and nothing else.
 */
const RETENTION_DAYS = Number(process.env.BROADCAST_RETENTION_DAYS) || 0;

if (RETENTION_DAYS > 0) {
  broadcastRecipientSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 },
  );
}

// Reclaiming rows whose worker died holding them.
broadcastRecipientSchema.index({ status: 1, claimedUntil: 1 });
