export type InboxConversationQueryState = {
  channelId: string;
  integrationId: string;
  integrationType: string;
  unassigned: boolean;
  awaitingResponse: boolean;
  automationStatus: string;
  participating: boolean;
  participated: boolean;
  mentioned: boolean;
  status: string;
  conversationId: string;
  created: string;
  brandId: string;
  searchValue: string;
};
