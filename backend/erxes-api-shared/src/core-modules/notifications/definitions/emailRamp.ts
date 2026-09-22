import { Document, Schema } from 'mongoose';

export interface IEmailRampDocument extends Document {
  _id: string;

  tier: number;
  day: string;
  usedToday: number;

  haltedAt?: Date;
  haltReason?: string;
  releasedAt?: Date;
  releasedBy?: string;
  releaseNote?: string;

  lastEvaluatedAt?: Date;
  lastRate?: number;

  createdAt: Date;
  updatedAt: Date;
}

export const EMAIL_RAMP_ID = 'ramp';

export const emailRampSchema = new Schema({
  _id: {
    type: String,
    default: EMAIL_RAMP_ID,
  },

  tier: {
    type: Number,
    default: 0,
  },

  day: {
    type: String,
    default: '',
  },

  usedToday: {
    type: Number,
    default: 0,
  },

  haltedAt: {
    type: Date,
  },

  haltReason: {
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

  lastEvaluatedAt: {
    type: Date,
  },

  lastRate: {
    type: Number,
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
