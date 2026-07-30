import { z } from 'zod';

export const DISCORD_EDIT_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
});

export const DISCORD_INTEGRATION_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
});

const DISCORD_BOT_PERMISSIONS = (
  2 ** 10 +
  2 ** 11 +
  2 ** 13 +
  2 ** 16 +
  2 ** 34 +
  2 ** 38
).toString();

export const buildDiscordInviteUrl = (applicationId: string) =>
  `https://discord.com/oauth2/authorize?client_id=${applicationId}` +
  `&permissions=${DISCORD_BOT_PERMISSIONS}&scope=bot`;
