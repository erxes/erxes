import { Schema } from 'mongoose';
import { DISCORD_NOTIFICATION_EVENTS } from '@/discordIntegration/constants';

export const discordMessageSchema = new Schema(
  {
    entityId: { type: String, label: 'Entity ID', required: true },
    channelId: { type: String, label: 'Channel ID', required: true },
    messageId: { type: String, label: 'Message ID', default: '' },
    configId: { type: String, label: 'Config ID', required: true },
    lastEvent: {
      type: String,
      enum: [...DISCORD_NOTIFICATION_EVENTS],
      label: 'Last Event',
    },
    audience: {
      type: String,
      enum: ['team', 'customer'],
      label: 'Audience',
      default: 'team',
    },
    discordUserId: { type: String, label: 'Reporter Discord User ID' },
    subdomain: { type: String, label: 'Subdomain', required: true },
  },
  { timestamps: true },
);

discordMessageSchema.index(
  { entityId: 1, channelId: 1, subdomain: 1 },
  { unique: true },
);
discordMessageSchema.index({ configId: 1, subdomain: 1 });
discordMessageSchema.index({ entityId: 1, audience: 1, subdomain: 1 });
