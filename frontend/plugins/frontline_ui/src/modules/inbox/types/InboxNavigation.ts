export type TInboxNavigationFilters = {
  awaitingResponse: boolean;
  brandId: string;
  channelId: string;
  conversationId: string;
  integrationId: string;
  integrationType: string;
  mentioned: boolean;
  participating: boolean;
  unassigned: boolean;
};

export type TInboxNavigationFilterValues = {
  [Key in keyof TInboxNavigationFilters]: TInboxNavigationFilters[Key] | null;
};

export const INBOX_NAVIGATION_FILTER_KEYS: Array<
  keyof TInboxNavigationFilters
> = [
  'participating',
  'mentioned',
  'unassigned',
  'awaitingResponse',
  'channelId',
  'integrationId',
  'integrationType',
  'brandId',
  'conversationId',
];

export const CLEARED_INBOX_NAVIGATION_FILTERS: TInboxNavigationFilterValues = {
  awaitingResponse: null,
  brandId: null,
  channelId: null,
  conversationId: null,
  integrationId: null,
  integrationType: null,
  mentioned: null,
  participating: null,
  unassigned: null,
};
