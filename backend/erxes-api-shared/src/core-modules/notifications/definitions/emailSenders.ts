import { Document, Schema } from 'mongoose';

/**
 * Whether this organization may still use the sender. Kept separate from the
 * provider's own verified/pending state: the provider says whether a message
 * would be accepted, this says whether the organization is entitled to ask.
 */
export type TEmailSenderState = 'active' | 'revoked' | 'suspended';

/**
 * A sender this organization registered.
 *
 * The provider account is shared by every organization on the deployment, so
 * its sender list cannot answer "may this organization send as that address" —
 * one organization verifying `info@example.com` would otherwise hand it to all
 * the others. These records are the per-organization claim, and they live in
 * the organization's own database, which is what scopes them.
 */
export interface IEmailSenderDocument extends Document {
  _id: string;

  email: string;
  name?: string;
  type: 'single' | 'domain';
  /** Which credential set it was registered against. */
  scope: string;

  state: TEmailSenderState;
  /** Provider-side identifier, kept for reconciliation. */
  providerId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const emailSenderSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },

  name: {
    type: String,
  },

  type: {
    type: String,
    enum: ['single', 'domain'],
    default: 'single',
  },

  scope: {
    type: String,
    default: 'transactional',
    index: true,
  },

  state: {
    type: String,
    enum: ['active', 'revoked', 'suspended'],
    default: 'active',
    index: true,
  },

  providerId: {
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

// One claim per address per credential set.
emailSenderSchema.index({ scope: 1, email: 1 }, { unique: true });
