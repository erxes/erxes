import { Document, Schema } from 'mongoose';

export interface IOAuthRefreshTokenDocument extends Document {
  tokenHash: string;
  userId: string;
  clientId: string;
  scope: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const oauthRefreshTokenSchema = new Schema(
  {
    tokenHash: {
      type: String,
      label: 'Token hash',
      index: true,
      unique: true,
    },
    userId: { type: String, label: 'User id', index: true },
    clientId: { type: String, label: 'Client id', index: true },
    scope: { type: String, label: 'Scope' },
    expiresAt: { type: Date, label: 'Expires at', index: true },
    revokedAt: { type: Date, label: 'Revoked at', index: true },
    replacedByTokenHash: { type: String, label: 'Replaced by token hash' },
  },
  {
    timestamps: true,
  },
);
