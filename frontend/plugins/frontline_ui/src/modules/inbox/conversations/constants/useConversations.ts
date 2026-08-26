import type { InboxConversationQueryState } from '@/inbox/conversations/types/useConversations';

export const CONVERSATION_FETCH_MORE_THRESHOLD = 80;

export const INBOX_CONVERSATION_QUERY_KEYS: (keyof InboxConversationQueryState)[] =
  [
    'channelId',
    'integrationId',
    'integrationType',
    'unassigned',
    'awaitingResponse',
    'automationStatus',
    'participating',
    'participated',
    'mentioned',
    'status',
    'conversationId',
    'created',
    'brandId',
    'searchValue',
  ];
