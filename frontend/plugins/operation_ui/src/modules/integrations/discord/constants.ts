import { TDiscordNotificationEvent } from './types';

export const DISCORD_NOTIFICATION_EVENTS = [
  'triageCreated',
  'triageAccepted',
  'triageDeclined',
  'taskAssigned',
  'taskCompleted',
] as const satisfies readonly TDiscordNotificationEvent[];

export const DISCORD_EVENT_OPTIONS: {
  value: TDiscordNotificationEvent;
  label: string;
  description: string;
}[] = [
  {
    value: 'triageCreated',
    label: 'New triage',
    description: 'A triage is added in erxes or opened from a GitHub issue.',
  },
  {
    value: 'triageAccepted',
    label: 'Triage accepted',
    description: 'A triage is accepted as a task.',
  },
  {
    value: 'triageDeclined',
    label: 'Triage declined',
    description: 'A triage is declined, with the reason when one is given.',
  },
  {
    value: 'taskAssigned',
    label: 'Task assigned',
    description: 'A task gets a new assignee.',
  },
  {
    value: 'taskCompleted',
    label: 'Task completed',
    description: 'A task moves to a completed status.',
  },
];

export const DISCORD_DEVELOPER_PORTAL_URL =
  'https://discord.com/developers/applications';

export const DISCORD_BOT_PERMISSIONS = [
  'View channels',
  'Send messages',
  'Embed links',
  'Read message history',
];

export const DISCORD_LINK_MESSAGE_TYPE = 'operation-discord-account-link';

export const DISCORD_ACCOUNT_PATH = '/operation/settings/discord-account';

export const DISCORD_LINK_POPUP_FEATURES = 'width=520,height=760';
