import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { emailSchema, messengerSchema, notificationSchema } from './common';

export const BROADCAST_RUN_STATUSES = [
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;

export const broadcastRunSchema = new Schema({
  _id: mongooseStringRandomId,

  engageMessageId: { type: String, label: 'Campaign', index: true },
  runCount: { type: Number, label: 'Run number' },

  // Copied at launch. A campaign edited while a run is draining must not
  // change what the recipients still waiting are about to receive.
  method: { type: String, label: 'Method' },
  email: { type: emailSchema, optional: true, label: 'Email' },
  messenger: { type: messengerSchema, optional: true, label: 'Messenger' },
  notification: {
    type: notificationSchema,
    optional: true,
    label: 'Notification',
  },
  automationId: { type: String, optional: true, label: 'Workflow' },
  fromEmail: { type: String, optional: true, label: 'From sender' },
  fromUserId: { type: String, optional: true, label: 'From user' },
  cpId: { type: String, optional: true, label: 'Client portal id' },
  configSet: { type: String, optional: true, label: 'SES configuration set' },

  // Which occurrence of a repeating schedule opened this run. Absent on a run
  // started by hand.
  scheduledFor: { type: Date, optional: true, label: 'Scheduled for' },

  status: {
    type: String,
    enum: BROADCAST_RUN_STATUSES,
    default: 'running',
    label: 'Status',
  },
  totalCount: { type: Number, default: 0, label: 'Recipients' },
  startedAt: { type: Date, default: Date.now, label: 'Started at' },
  finishedAt: { type: Date, optional: true, label: 'Finished at' },
});

broadcastRunSchema.index({ engageMessageId: 1, runCount: 1 }, { unique: true });

// The calendar asks what went out between two moments, across every campaign.
broadcastRunSchema.index({ startedAt: 1 });

// One occurrence, one run. An alarm delivered twice — a retry, a re-armed
// chain, two workers racing — is refused by the database rather than by a
// check that can lose the race.
broadcastRunSchema.index(
  { engageMessageId: 1, scheduledFor: 1 },
  {
    unique: true,
    partialFilterExpression: { scheduledFor: { $exists: true } },
  },
);
