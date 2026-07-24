import { gql } from '@apollo/client';

export const CONVERSATION_COUNTS = gql`
  query ConversationCounts($only: String, $channelId: String, $brandId: String) {
    conversationCounts(only: $only, channelId: $channelId, brandId: $brandId)
  }
`;
