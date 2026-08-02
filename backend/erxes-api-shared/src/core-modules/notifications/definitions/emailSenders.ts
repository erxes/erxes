import { Document, Schema } from 'mongoose';

export type TEmailSenderState = 'pending' | 'active' | 'revoked' | 'suspended';

export interface IEmailSenderDocument extends Document {
  _id: string;

  email: string;
  name?: string;
  type: 'single' | 'domain';
  scope: string;

  state: TEmailSenderState;
  providerId?: string;

  verifiedAt?: Date;
  verificationToken?: string;
  verificationSentAt?: Date;

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
    enum: ['pending', 'active', 'revoked', 'suspended'],
    default: 'pending',
    index: true,
  },

  providerId: {
    type: String,
  },

  verifiedAt: {
    type: Date,
  },

  verificationToken: {
    type: String,
    index: true,
  },

  verificationSentAt: {
    type: Date,
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
