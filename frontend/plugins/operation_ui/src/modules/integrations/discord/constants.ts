import { TDiscordMention, TDiscordNotificationEvent } from './types';

export const DISCORD_DEFAULT_EVENTS = [
  'triageCreated',
  'triageAccepted',
  'triageDeclined',
  'taskAssigned',
  'taskCompleted',
  'taskReopened',
  'taskCancelled',
  'taskMoved',
] as const satisfies readonly TDiscordNotificationEvent[];

export const DISCORD_NOTIFICATION_EVENTS = [
  ...DISCORD_DEFAULT_EVENTS,
  'pullRequestMerged',
] as const satisfies readonly TDiscordNotificationEvent[];

export const DISCORD_EVENT_OPTIONS: {
  value: TDiscordNotificationEvent;
  label: string;
  description: string;
  requiresGithubRepo?: boolean;
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
  {
    value: 'taskReopened',
    label: 'Task reopened',
    description: 'A completed or cancelled task, or a declined triage, is opened again.',
  },
  {
    value: 'taskCancelled',
    label: 'Task cancelled',
    description: 'A task moves to a cancelled status.',
  },
  {
    value: 'taskMoved',
    label: 'Task moved',
    description:
      'A task or triage moves into or out of this team. A card it leaves is kept and marked as moved instead of being deleted.',
  },
  {
    value: 'pullRequestMerged',
    label: 'PR merged',
    description: 'A pull request is merged in this team’s GitHub repository.',
    requiresGithubRepo: true,
  },
];

export const DISCORD_MENTIONS = [
  'none',
  'here',
  'everyone',
] as const satisfies readonly TDiscordMention[];

export const DISCORD_MENTION_OPTIONS: {
  value: TDiscordMention;
  label: string;
  description: string;
}[] = [
  {
    value: 'none',
    label: 'Nobody',
    description: 'Messages are posted without a mention.',
  },
  {
    value: 'here',
    label: '@here',
    description: 'Notifies the members who are online.',
  },
  {
    value: 'everyone',
    label: '@everyone',
    description: 'Notifies every member of the server.',
  },
];

export const DISCORD_DEVELOPER_PORTAL_URL =
  'https://discord.com/developers/applications';

export const DISCORD_BOT_PERMISSIONS = [
  'View channels',
  'Send messages',
  'Send messages in threads',
  'Embed links',
  'Read message history',
];

export const DISCORD_LINK_MESSAGE_TYPE = 'operation-discord-account-link';

export const DISCORD_LINK_RESULT_PARAM = 'discordLink';

export const DISCORD_LINK_ERROR_PARAM = 'discordLinkError';

export const DISCORD_LINK_ERROR_MESSAGES: Record<string, string> = {
  expired: 'This Discord sign-in link is invalid or has expired. Start again.',
  cancelled: 'Discord sign-in was cancelled.',
  'not-set-up':
    'Discord account linking is no longer set up. Ask an admin to add the client secret.',
  failed: 'Discord sign-in failed. Try again.',
};

export const DISCORD_ACCOUNT_PATH = '/operation/settings/discord-account';

export const DISCORD_LINK_POPUP_FEATURES = 'width=520,height=760';
