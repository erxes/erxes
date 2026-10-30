import { Document, Schema } from 'mongoose';

export type TwoFactorMode = 'off' | 'optional' | 'required';

export interface ITwoFactorPolicy {
  mode: TwoFactorMode;
  // Required mode only: empty means everyone, otherwise members of these groups
  permissionGroupIds: string[];
}

export interface ITwoFactorDocument extends Document {
  userId: string;
  // Sealed with sealSecret; never returned after setup
  secret: string;
  // Unset while setup is waiting for the first code
  confirmedAt?: Date;
  recoveryCodeHashes: string[];
  // Last accepted TOTP step, so a code cannot be replayed
  lastUsedStep: number;
  createdAt: Date;
  updatedAt: Date;
}

export const twoFactorSchema = new Schema(
  {
    userId: { type: String, label: 'User id', required: true, unique: true },
    secret: { type: String, label: 'Secret', required: true },
    confirmedAt: { type: Date, label: 'Confirmed at' },
    recoveryCodeHashes: {
      type: [String],
      label: 'Recovery code hashes',
      default: [],
    },
    lastUsedStep: { type: Number, label: 'Last used step', default: -1 },
  },
  {
    timestamps: true,
  },
);
