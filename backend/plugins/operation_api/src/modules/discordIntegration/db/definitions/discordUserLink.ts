import { Schema } from 'mongoose';

export const discordUserLinkSchema = new Schema(
  {
    userId: { type: String, label: 'User ID', required: true },
    discordUserId: { type: String, label: 'Discord User ID', required: true },
    username: { type: String, label: 'Discord Username', required: true },
    globalName: { type: String, label: 'Discord Display Name' },
    avatarUrl: { type: String, label: 'Discord Avatar URL' },
    linkedAt: { type: Date, label: 'Linked At', required: true },
    subdomain: { type: String, label: 'Subdomain', required: true },
  },
  { timestamps: true },
);

discordUserLinkSchema.index({ userId: 1, subdomain: 1 }, { unique: true });
discordUserLinkSchema.index(
  { discordUserId: 1, subdomain: 1 },
  { unique: true },
);
