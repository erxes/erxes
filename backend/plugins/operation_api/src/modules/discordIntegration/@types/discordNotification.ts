import { DISCORD_NOTIFICATION_EVENTS } from '@/discordIntegration/constants';

export type TDiscordNotificationEvent =
  (typeof DISCORD_NOTIFICATION_EVENTS)[number];

export type TDiscordNotificationTarget = 'team' | 'customer';

export type TDiscordRemovedRecord = {
  entityId: string;
  label: string;
  name: string;
};

export type TDiscordCleanupJob = {
  type: 'cleanup';
  subdomain: string;
  records: TDiscordRemovedRecord[];
  configIds?: string[];
};

export type TDiscordNotificationJob = {
  target?: TDiscordNotificationTarget;
  subdomain: string;
  event: TDiscordNotificationEvent;
  entityId: string;
  teamId: string;
  actorId?: string;
  reason?: string;
};
