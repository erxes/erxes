import type { JobsOptions } from 'bullmq';

export const DISCORD_API_URL = 'https://discord.com/api/v10';

export const DISCORD_OAUTH_AUTHORIZE_URL =
  'https://discord.com/oauth2/authorize';

export const DISCORD_OAUTH_CALLBACK_PATH =
  '/integrations/discord/oauth/callback';

export const DISCORD_ACCOUNT_PAGE_PATH = '/operation/settings/discord-account';

export const DISCORD_LINK_STATE_PREFIX = 'operation:discord:account-link:';

export const DISCORD_LINK_STATE_TTL_SECONDS = 600;

export const DISCORD_LINK_MESSAGE_TYPE = 'operation-discord-account-link';

export const DISCORD_NOTIFICATION_EVENTS = [
  'triageCreated',
  'triageAccepted',
  'triageDeclined',
  'taskAssigned',
  'taskCompleted',
] as const;

export const DISCORD_NOTIFY_QUEUE = 'discord-notify';

export const DISCORD_NOTIFY_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 5000 },
};

export const DISCORD_CARD_CLAIM_TIMEOUT_MS = 60_000;

export const DISCORD_MAX_RATE_LIMIT_RETRIES = 2;

export const DISCORD_BOT_PERMISSIONS =
  (1 << 10) | (1 << 11) | (1 << 14) | (1 << 16);

export const DISCORD_MESSAGE_CHANNEL_TYPES = [0, 5];

export const DISCORD_ERROR_CODES = {
  UNKNOWN_CHANNEL: 10003,
  UNKNOWN_MESSAGE: 10008,
  UNKNOWN_MEMBER: 10007,
  MISSING_ACCESS: 50001,
  MISSING_PERMISSIONS: 50013,
};

export const DISCORD_CARD_COLORS = {
  triage: 0xf59e0b,
  open: 0x3b82f6,
  completed: 0x10b981,
  cancelled: 0xef4444,
};

export const DISCORD_LIMITS = {
  title: 256,
  description: 4096,
  descriptionPreview: 300,
  fieldValue: 1024,
  footer: 2048,
  content: 2000,
};
