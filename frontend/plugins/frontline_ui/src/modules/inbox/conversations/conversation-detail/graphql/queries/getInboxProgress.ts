import { gql } from '@apollo/client';

export const CONVERSATION_MEMBER_PROGRESS = gql`
  query ConversationMemberProgress($customerId: String!, $fromDate: String, $toDate: String) {
    conversationMemberProgress(customerId: $customerId, fromDate: $fromDate, toDate: $toDate) {
      assigneeId
      new
      open
      closed
      resolved
    }
  }
`;

export const CONVERSATION_SOURCE_PROGRESS = gql`
  query ConversationSourceProgress($customerId: String!, $fromDate: String, $toDate: String) {
    conversationSourceProgress(customerId: $customerId, fromDate: $fromDate, toDate: $toDate) {
      new { source count }
      open { source count }
      closed { source count }
      resolved { source count }
    }
  }
`;

export const CONVERSATION_TAG_PROGRESS = gql`
  query ConversationTagProgress($customerId: String!, $fromDate: String, $toDate: String) {
    conversationTagProgress(customerId: $customerId, fromDate: $fromDate, toDate: $toDate) {
      new { tagId count }
      open { tagId count }
      closed { tagId count }
      resolved { tagId count }
    }
  }
`;

export const CONVERSATION_PROGRESS_CHART = gql`
  query ConversationProgressChart($customerId: String!, $fromDate: String, $toDate: String) {
    conversationProgressChart(customerId: $customerId, fromDate: $fromDate, toDate: $toDate) {
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
