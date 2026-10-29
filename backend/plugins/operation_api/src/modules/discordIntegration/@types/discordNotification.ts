import { DISCORD_NOTIFICATION_EVENTS } from '@/discordIntegration/constants';

export type TDiscordNotificationEvent =
  (typeof DISCORD_NOTIFICATION_EVENTS)[number];

export type TDiscordNotificationJob = {
  subdomain: string;
  event: TDiscordNotificationEvent;
  entityId: string;
  teamId: string;
  actorId?: string;
  reason?: string;
};
