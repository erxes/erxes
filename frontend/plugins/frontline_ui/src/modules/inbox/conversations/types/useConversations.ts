export type InboxConversationQueryState = {
  channelId: string;
  integrationId: string;
  integrationType: string;
  unassigned: boolean;
  awaitingResponse: boolean;
  withPoll: boolean;
  automationStatus: string;
  participating: boolean;
  participated: boolean;
  mentioned: boolean;
  unread: boolean;
  status: string;
  conversationId: string;
  created: string;
  brandId: string;
  searchValue: string;
};
