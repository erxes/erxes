export type InboxTarget = {
  channelId: string;
  integrationId: string;
  integrationType: string;
  withPoll: string;
};

export const INBOX_TARGET_KEYS: (keyof InboxTarget)[] = [
  'channelId',
  'integrationId',
  'integrationType',
  'withPoll',
];
