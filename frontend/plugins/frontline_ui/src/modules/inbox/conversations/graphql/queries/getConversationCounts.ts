import { gql } from '@apollo/client';

export const CONVERSATION_COUNTS = gql`
  query ConversationCounts(
    $only: String
    $channelId: String
    $brandId: String
    $awaitingResponse: String
  ) {
    conversationCounts(
      only: $only
      channelId: $channelId
      brandId: $brandId
      awaitingResponse: $awaitingResponse
    )
  }
`;

export const INBOX_SIDEBAR_WORK_COUNTS = gql`
  query FrontlineInboxSidebarWorkCounts($unread: String) {
    conversationCounts(unread: $unread)
  }
`;

export const INBOX_NEW_CONVERSATION_COUNT = gql`
  query FrontlineInboxNewConversationCount {
    conversationsTotalCount(status: "new")
  }
`;

export const CONVERSATION_FILTER_COUNTS = gql`
  query FrontlineInboxConversationFilterCounts(
    $channelId: String
    $integrationId: String
    $integrationType: String
    $brandId: String
    $startDate: String
    $endDate: String
    $searchValue: String
  ) {
    unresolved: conversationsTotalCount(
      channelId: $channelId
      integrationId: $integrationId
      integrationType: $integrationType
      brandId: $brandId
      startDate: $startDate
      endDate: $endDate
      searchValue: $searchValue
    )
    conversationCounts(
      channelId: $channelId
      integrationId: $integrationId
      integrationType: $integrationType
      brandId: $brandId
      startDate: $startDate
      endDate: $endDate
      searchValue: $searchValue
    )
  }
`;
