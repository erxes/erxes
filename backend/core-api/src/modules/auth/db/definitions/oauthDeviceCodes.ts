import { Document, Schema } from 'mongoose';

export type OAuthDeviceCodeStatus = 'pending' | 'approved' | 'denied';

export interface IOAuthDeviceCodeDocument extends Document {
  deviceCodeHash: string;
  userCodeHash: string;
  clientId: string;
  scope: string;
  grantedScope?: string;
  userId?: string;
  status: OAuthDeviceCodeStatus;
  expiresAt: Date;
  approvedAt?: Date;
  lastPolledAt?: Date;
  failedAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export const oauthDeviceCodeSchema = new Schema(
  {
    deviceCodeHash: {
      type: String,
      label: 'Device code hash',
      index: true,
      unique: true,
    },
    userCodeHash: {
      type: String,
      label: 'User code hash',
      index: true,
      unique: true,
    },
    clientId: { type: String, label: 'Client id', index: true },
    scope: { type: String, label: 'Scope' },
    grantedScope: { type: String, label: 'Granted scope' },
    userId: { type: String, label: 'User id', index: true },
    status: {
      type: String,
      label: 'Status',
      enum: ['pending', 'approved', 'denied'],
      default: 'pending',
      index: true,
    },
    expiresAt: { type: Date, label: 'Expires at', index: true },
    approvedAt: { type: Date, label: 'Approved at' },
    lastPolledAt: { type: Date, label: 'Last polled at' },
    failedAttempts: {
      type: Number,
      label: 'Failed approval attempts',
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
