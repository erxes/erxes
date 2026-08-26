export type InboxTarget = {
  channelId: string;
  integrationId: string;
  integrationType: string;
};

export const INBOX_TARGET_KEYS: (keyof InboxTarget)[] = [
  'channelId',
  'integrationId',
  'integrationType',
];
