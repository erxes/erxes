import { Document, Schema } from 'mongoose';

export type TEmailSuppressionReason =
  | 'hard_bounce'
  | 'complaint'
  | 'unsubscribe'
  | 'screened'
  | 'manual';

export type TEmailLane = 'proven' | 'unknown' | 'suppressed';

export const EMAIL_LANES: TEmailLane[] = ['proven', 'unknown', 'suppressed'];

export type TMailKind = 'marketing' | 'transactional';

export interface IEmailAddressDocument extends Document {
  _id: string;
  email: string;

  lastSentAt?: Date;
  /** Proof the mailbox accepted mail at that moment. */
  lastDeliveredAt?: Date;
  deliveredCount: number;

  softBounceCount: number;
  lastSoftBounceAt?: Date;

  suppressedAt?: Date;
  suppressionReason?: TEmailSuppressionReason;
  suppressedBy?: string;

  releasedAt?: Date;
  releasedBy?: string;
  releaseNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const emailAddressSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  lastSentAt: {
    type: Date,
  },

  lastDeliveredAt: {
    type: Date,
  },

  deliveredCount: {
    type: Number,
    default: 0,
  },

  softBounceCount: {
    type: Number,
    default: 0,
  },

  lastSoftBounceAt: {
    type: Date,
  },

  suppressedAt: {
    type: Date,
  },

  suppressionReason: {
    type: String,
    enum: ['hard_bounce', 'complaint', 'unsubscribe', 'screened', 'manual'],
  },

  /** Only set when a person did it, so the decision can be traced back. */
  suppressedBy: {
    type: String,
  },

  releasedAt: {
    type: Date,
  },

  releasedBy: {
    type: String,
  },

  releaseNote: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

emailAddressSchema.index({ suppressedAt: 1 });
emailAddressSchema.index({ lastDeliveredAt: -1 });
