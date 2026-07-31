import { Document, Schema } from 'mongoose';

export type TEmailSuppressionReason =
  | 'hard_bounce'
  | 'complaint'
  | 'unsubscribe'
  | 'manual';

/**
 * What this organization has learned about an address by mailing it.
 *
 * Deliberately carries no TTL. `email_deliveries` expires after 90 days because
 * it is an event stream; this is the conclusion drawn from those events and has
 * to outlive them, or a suppressed address quietly frees itself once the events
 * that closed it expire.
 */
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
    enum: ['hard_bounce', 'complaint', 'unsubscribe', 'manual'],
  },

  /** Only set when a person did it, so the decision can be traced back. */
  suppressedBy: {
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
