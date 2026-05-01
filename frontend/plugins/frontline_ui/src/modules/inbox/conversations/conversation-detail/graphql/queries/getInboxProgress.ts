import { gql } from '@apollo/client';

export const CONVERSATION_MEMBER_PROGRESS = gql`
query ConversationMemberProgress($customerId: String!) {
  conversationMemberProgress(customerId: $customerId) {
    assigneeId
    new
    open
    closed
    resolved
  }
}
`;

export const CONVERSATION_SOURCE_PROGRESS = gql`
  query ConversationSourceProgress($customerId: String!) {
    conversationSourceProgress(customerId: $customerId) {
      new { source count }
      open { source count }
      closed { source count }
      resolved { source count }
    }
  }
`;

export const CONVERSATION_TAG_PROGRESS = gql`
  query ConversationTagProgress($customerId: String!) {
    conversationTagProgress(customerId: $customerId) {
      new { tagId count }
      open { tagId count }
      closed { tagId count }
      resolved { tagId count }
    }
  }
`;

export const CONVERSATION_PROGRESS_CHART = gql`
  query ConversationProgressChart($customerId: String!) {
    conversationProgressChart(customerId: $customerId) {
      total
      chartData {
        date
        new
        open
        closed
        resolved
      }
    }
  }
`;
