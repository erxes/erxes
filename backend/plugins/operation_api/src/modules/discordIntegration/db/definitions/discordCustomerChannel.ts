import { Schema } from 'mongoose';

export const discordCustomerChannelSchema = new Schema(
  {
    connectionId: { type: String, label: 'Connection ID', required: true },
    guildId: { type: String, label: 'Guild ID', required: true },
    channelId: { type: String, label: 'Channel ID', required: true },
    channelName: { type: String, label: 'Channel Name', required: true },
    companyId: { type: String, label: 'Company ID', required: true },
    teamId: { type: Schema.Types.ObjectId, label: 'Team ID', required: true },
    createdBy: { type: String, label: 'Created By' },
    subdomain: { type: String, label: 'Subdomain', required: true },
  },
  { timestamps: true },
);

discordCustomerChannelSchema.index(
  { channelId: 1, subdomain: 1 },
  { unique: true },
);
discordCustomerChannelSchema.index({ connectionId: 1, subdomain: 1 });
discordCustomerChannelSchema.index({ companyId: 1, subdomain: 1 });
