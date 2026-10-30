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

export const DISCORD_CUSTOMER_EVENTS = [
  'triageAccepted',
  'triageDeclined',
  'taskAssigned',
  'taskCompleted',
];

export const DISCORD_NOTIFY_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 5000 },
};

export const DISCORD_CARD_CLAIM_TIMEOUT_MS = 60_000;

export const DISCORD_MAX_RATE_LIMIT_RETRIES = 2;

export const DISCORD_BOT_PERMISSIONS =
  (1 << 10) | (1 << 11) | (1 << 14) | (1 << 16);

export const DISCORD_BOT_SCOPES = 'bot applications.commands';

export const DISCORD_MESSAGE_CHANNEL_TYPES = [0, 5];

export const DISCORD_ERROR_CODES = {
  UNKNOWN_CHANNEL: 10003,
  UNKNOWN_MESSAGE: 10008,
  CANNOT_EDIT_OTHER_USER_MESSAGE: 50005,
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

export const DISCORD_INTERACTIONS_PATH = '/integrations/discord/interactions';

export const DISCORD_SIGNATURE_TOLERANCE_SECONDS = 300;

export const DISCORD_INTERACTION_TYPES = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  MODAL_SUBMIT: 5,
};

export const DISCORD_RESPONSE_TYPES = {
  PONG: 1,
  CHANNEL_MESSAGE: 4,
  DEFERRED_CHANNEL_MESSAGE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  MODAL: 9,
};

export const DISCORD_EPHEMERAL_FLAG = 1 << 6;

export const DISCORD_INTERACTION_EDIT_RETRY = { attempts: 3, delayMs: 500 };

export const DISCORD_INTERACTION_ERROR_MESSAGE =
  'Something went wrong. Try again in a moment.';

export const DISCORD_COMMANDS_SYNC_LOCK = {
  ttlSeconds: 60,
  keyPrefix: 'operation:discord:commands-sync:',
};

export const DISCORD_TRIAGE_MODAL_ID = 'operation:triage-new';

export const DISCORD_TASKS_BUTTON_PREFIX = 'operation:tasks';

export const DISCORD_TASKS_PAGE_SIZE = 10;

export const DISCORD_TASKS_FETCH_LIMIT = 200;

export const DISCORD_TRIAGE_RATE_LIMIT = {
  max: 10,
  windowSeconds: 3600,
  keyPrefix: 'operation:discord:triage-rate:',
};

export const DISCORD_TRIAGE_PRIORITY_RANGE = { min: 0, max: 4 };

export const DISCORD_TRIAGE_PRIORITY_OPTIONS = [
  { label: 'Critical', value: '4' },
  { label: 'High', value: '3' },
  { label: 'Medium', value: '2' },
  { label: 'Minor', value: '1' },
  { label: 'No priority', value: '0' },
];

export const DISCORD_TRIAGE_INPUT_LIMITS = {
  title: 200,
  description: 2000,
};

export const DISCORD_SLASH_COMMANDS = [
  {
    name: 'triage',
    description: 'Report issues to the team',
    type: 1,
    options: [
      {
        type: 1,
        name: 'new',
        description: 'Report a new issue to the team',
      },
    ],
  },
  {
    name: 'tasks',
    description: "List this company's tasks",
    type: 1,
  },
];
