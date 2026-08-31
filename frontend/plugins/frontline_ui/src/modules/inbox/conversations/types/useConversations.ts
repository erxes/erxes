export type InboxConversationQueryState = {
  channelId: string;
  integrationId: string;
  integrationType: string;
  unassigned: boolean;
  awaitingResponse: boolean;
  withPoll: boolean;
  automationStatus: string;
  participated: boolean;
  status: string;
  conversationId: string;
  created: string;
  brandId: string;
  searchValue: string;
};
