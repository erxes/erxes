import { Schema } from 'mongoose';

export const appSchema = new Schema(
  {
    name: { type: String, label: 'App name' },
    token: { type: String, label: 'API token' },
    status: { type: String, label: 'Status', default: 'active' },
    lastUsedAt: { type: Date, label: 'Last used at' },
  },
  {
    timestamps: true,
  },
);
