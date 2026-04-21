import { Document, Schema } from 'mongoose';

export type OAuthClientAppType = 'public' | 'confidential';
export type OAuthClientAppStatus = 'active' | 'revoked';

export interface IOAuthClientAppDocument extends Document {
  name: string;
  logo?: string;
  description?: string;
  clientId: string;
  type: OAuthClientAppType;
  redirectUrls: string[];
  secretHash?: string;
  status: OAuthClientAppStatus;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const oauthClientAppSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true, trim: true },
    logo: { type: String, label: 'Logo' },
    description: { type: String, label: 'Description' },
    clientId: {
      type: String,
      label: 'Client id',
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      label: 'Type',
      enum: ['public', 'confidential'],
      required: true,
      default: 'public',
    },
    redirectUrls: {
      type: [String],
      label: 'Redirect urls',
      default: [],
    },
    secretHash: { type: String, label: 'Secret hash' },
    status: {
      type: String,
      label: 'Status',
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    lastUsedAt: { type: Date, label: 'Last used at' },
  },
  {
    timestamps: true,
  },
);
