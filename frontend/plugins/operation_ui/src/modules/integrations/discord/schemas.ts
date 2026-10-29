import { z } from 'zod';
import { DISCORD_NOTIFICATION_EVENTS } from './constants';

export const DISCORD_CONNECT_SCHEMA = z.object({
  token: z.string().trim().min(1, 'Paste the bot token'),
  guildId: z.string().min(1, 'Choose a Discord server'),
});

export type TDiscordConnectForm = z.infer<typeof DISCORD_CONNECT_SCHEMA>;

export const DISCORD_TEAM_CONFIG_SCHEMA = z.object({
  connectionId: z.string().min(1, 'Choose a Discord server'),
  channelId: z.string().min(1, 'Choose a channel'),
  events: z
    .array(z.enum(DISCORD_NOTIFICATION_EVENTS))
    .min(1, 'Choose at least one event'),
  isActive: z.boolean(),
});

export type TDiscordTeamConfigForm = z.infer<typeof DISCORD_TEAM_CONFIG_SCHEMA>;

export const DISCORD_CLIENT_SECRET_SCHEMA = z.object({
  clientSecret: z.string().trim().min(1, 'Paste the client secret'),
});

export type TDiscordClientSecretForm = z.infer<
  typeof DISCORD_CLIENT_SECRET_SCHEMA
>;
