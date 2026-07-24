import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const healthSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['healthy', 'degraded', 'broken', 'syncing'],
      default: 'syncing',
      index: true,
    },
    isTokenValid: { type: Boolean },
    botUsername: { type: String },
    lastVerifiedAt: { type: Date },
    lastError: { type: String },
    backfillPending: { type: Boolean },
  },
  { _id: false },
);

export const discordBotSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true },
    applicationId: { type: String, required: true },
    token: { type: String, required: true },
    guildId: { type: String },
    guildName: { type: String },
    channelId: { type: String },
    description: { type: String },
    erxesApiId: { type: String, label: 'Inbox integration id' },
    createdBy: { type: String, index: true },
    updatedBy: { type: String },
    health: { type: healthSchema, default: () => ({}) },
  },
  { timestamps: true },
);
