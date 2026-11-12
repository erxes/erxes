import {
  DISCORD_CARD_EVENTS,
  DISCORD_NOTIFICATION_EVENTS,
} from '@/discordIntegration/constants';

export type TDiscordNotificationEvent =
  (typeof DISCORD_NOTIFICATION_EVENTS)[number];

export type TDiscordCardEvent = (typeof DISCORD_CARD_EVENTS)[number];

export type TDiscordNotificationTarget = 'team' | 'customer';

export type TDiscordRemovedRecord = {
  entityId: string;
  label: string;
  name: string;
  companyId?: string | null;
};

export type TDiscordCleanupJob = {
  type: 'cleanup';
  subdomain: string;
  records: TDiscordRemovedRecord[];
  configIds?: string[];
};

export type TDiscordTaskMove = {
  fromTeamId: string;
  toTeamId: string;
};

export type TDiscordNotificationJob = {
  target?: TDiscordNotificationTarget;
  configId?: string;
  subdomain: string;
  event: TDiscordCardEvent;
  entityId: string;
  teamId: string;
  actorId?: string;
  assigneeId?: string;
  reason?: string;
  move?: TDiscordTaskMove;
};

export type TDiscordPullRequest = {
  number: number;
  title: string;
  body: string;
  url: string;
  repoName: string;
  authorLogin: string;
  authorUrl: string;
  mergedByLogin: string;
  headRef: string;
  baseRef: string;
  mergedAt: string;
};

export type TDiscordPullRequestJob = {
  type: 'pullRequestMerged';
  configId?: string;
  subdomain: string;
  teamId: string;
  pullRequest: TDiscordPullRequest;
};

export type TDiscordJob =
  | TDiscordNotificationJob
  | TDiscordCleanupJob
  | TDiscordPullRequestJob;
