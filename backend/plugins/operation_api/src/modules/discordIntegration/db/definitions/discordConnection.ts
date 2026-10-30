import { Schema } from 'mongoose';

const discordHealthSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['healthy', 'broken'],
      label: 'Status',
      default: 'healthy',
    },
    lastVerifiedAt: { type: Date, label: 'Last Verified At' },
    lastError: { type: String, label: 'Last Error' },
  },
  { _id: false },
);

export const discordConnectionSchema = new Schema(
  {
    guildId: { type: String, label: 'Guild ID', required: true },
    guildName: { type: String, label: 'Guild Name', required: true },
    guildIconUrl: { type: String, label: 'Guild Icon URL' },
    applicationId: {
      type: String,
      label: 'Application ID',
      required: true,
    },
    botUserId: { type: String, label: 'Bot User ID', required: true },
    botUsername: { type: String, label: 'Bot Username', required: true },
    token: { type: String, label: 'Bot Token', required: true, select: false },
    clientSecret: { type: String, label: 'Client Secret', select: false },
    hasClientSecret: {
      type: Boolean,
      label: 'Has Client Secret',
      default: false,
    },
    publicKey: { type: String, label: 'Public Key' },
    commandsRegisteredAt: { type: Date, label: 'Commands Registered At' },
    commandsVersion: { type: String, label: 'Commands Version' },
    commandsError: { type: String, label: 'Commands Error' },
    health: { type: discordHealthSchema, label: 'Health', default: {} },
    createdBy: { type: String, label: 'Created By' },
    subdomain: { type: String, label: 'Subdomain', required: true },
  },
  { timestamps: true },
);

discordConnectionSchema.index({ guildId: 1, subdomain: 1 }, { unique: true });
