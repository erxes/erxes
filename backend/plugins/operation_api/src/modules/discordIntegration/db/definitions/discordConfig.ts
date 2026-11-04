import { Schema } from 'mongoose';
import {
  DISCORD_MENTION_TARGETS,
  DISCORD_NOTIFICATION_EVENTS,
} from '@/discordIntegration/constants';

export const discordConfigSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, label: 'Team ID', required: true },
    connectionId: { type: String, label: 'Connection ID', required: true },
    channelId: { type: String, label: 'Channel ID', required: true },
    channelName: { type: String, label: 'Channel Name', required: true },
    events: {
      type: [{ type: String, enum: [...DISCORD_NOTIFICATION_EVENTS] }],
      label: 'Events',
      default: [],
    },
    mention: {
      type: String,
      enum: [...DISCORD_MENTION_TARGETS],
      label: 'Mention',
      default: 'none',
    },
    mentionEvents: {
      type: [{ type: String, enum: [...DISCORD_NOTIFICATION_EVENTS] }],
      label: 'Mention Events',
      default: [],
    },
    isActive: { type: Boolean, label: 'Is Active', default: true },
    lastError: { type: String, label: 'Last Error' },
    lastSentAt: { type: Date, label: 'Last Sent At' },
    subdomain: { type: String, label: 'Subdomain', required: true },
  },
  { timestamps: true },
);

discordConfigSchema.index(
  { teamId: 1, channelId: 1, subdomain: 1 },
  { unique: true },
);
discordConfigSchema.index({ connectionId: 1, subdomain: 1 });
