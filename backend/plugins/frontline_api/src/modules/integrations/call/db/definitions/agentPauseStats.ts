import { Schema } from 'mongoose';
import { field } from '../utils';

const pauseIntervalSchema = new Schema(
  {
    start: field({ type: Date, required: true }),
    end: field({ type: Date, required: true }),
    durationSec: field({ type: Number, default: 0 }),
  },
  { _id: false },
);

export const agentPauseStatsSchema = new Schema(
  {
    integrationId: field({ type: String, required: true }),
    queue: field({ type: String, required: true }),
    extension: field({ type: String, required: true }),
    date: field({
      type: String,
      required: true,
      label: 'PBX-local calendar day, YYYY-MM-DD',
    }),
    firstName: field({ type: String, optional: true }),
    lastName: field({ type: String, optional: true }),
    status: field({ type: String, optional: true }),
    answer: field({ type: Number, default: 0 }),
    abandon: field({ type: Number, default: 0 }),
    talktime: field({ type: Number, default: 0 }),
    pauseReason: field({ type: String, optional: true }),
    currentPauseStartedAt: field({ type: Date, optional: true }),
    pauseIntervals: { type: [pauseIntervalSchema], default: [] },
    totalPausedSec: field({ type: Number, default: 0 }),
  },
  { timestamps: true },
);

agentPauseStatsSchema.index(
  { integrationId: 1, queue: 1, extension: 1, date: 1 },
  { unique: true },
);
agentPauseStatsSchema.index({ integrationId: 1, queue: 1, date: 1 });
