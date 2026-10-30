import { Schema } from 'mongoose';

export const discordSourceSchema = new Schema(
  {
    userId: { type: String, label: 'Discord User ID' },
    username: { type: String, label: 'Discord Username' },
    displayName: { type: String, label: 'Discord Display Name' },
    channelId: { type: String, label: 'Discord Channel ID' },
    guildId: { type: String, label: 'Discord Guild ID' },
  },
  { _id: false },
);
