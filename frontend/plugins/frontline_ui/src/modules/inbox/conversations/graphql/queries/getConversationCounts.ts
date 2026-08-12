import { gql } from '@apollo/client';

export const CONVERSATION_COUNTS = gql`
  query ConversationCounts(
    $only: String
    $channelId: String
    $integrationId: String
    $integrationType: String
    $brandId: String
    $awaitingResponse: String
    $startDate: String
    $endDate: String
    $searchValue: String
  ) {
    conversationCounts(
      only: $only
      channelId: $channelId
      integrationId: $integrationId
      integrationType: $integrationType
      brandId: $brandId
      awaitingResponse: $awaitingResponse
      startDate: $startDate
      endDate: $endDate
      searchValue: $searchValue
    )
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
