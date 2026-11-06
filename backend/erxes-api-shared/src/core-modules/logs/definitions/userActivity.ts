import { Document, Schema } from 'mongoose';

// Absolute 5-minute buckets since epoch; timezone is applied only when displaying
export const USER_ACTIVITY_SLOT_MS = 5 * 60 * 1000;
export const USER_ACTIVITY_DAY_MS = 24 * 60 * 60 * 1000;

const RETENTION_SECS = 400 * 24 * 60 * 60;

export interface IUserActivityDaily {
  userId: string;
  // Storage partition only; a local day may span two of these
  utcDay: Date;
  slots: number[];
  lastSlot: number;
}

export interface IUserActivityDailyDocument
  extends IUserActivityDaily,
    Document {
  _id: string;
}

export const userActivityDailySchema = new Schema({
  userId: { type: String, required: true },
  utcDay: { type: Date, required: true },
  slots: { type: [Number], default: [] },
  lastSlot: { type: Number, required: true },
});

userActivityDailySchema.index({ userId: 1, utcDay: 1 }, { unique: true });
userActivityDailySchema.index(
  { utcDay: 1 },
  { expireAfterSeconds: RETENTION_SECS },
);
