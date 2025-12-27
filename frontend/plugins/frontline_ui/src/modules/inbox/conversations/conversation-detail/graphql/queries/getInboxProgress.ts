import { gql } from '@apollo/client';

export const CONVERSATION_MEMBER_PROGRESS = gql`
  query ConversationMemberProgress($customerId: String!) {
    conversationMemberProgress(customerId: $customerId)
  }
`;

export const CONVERSATION_SOURCE_PROGRESS = gql`
  query ConversationSourceProgress($customerId: String!) {
    conversationSourceProgress(customerId: $customerId)
  }
`;

export const CONVERSATION_TAG_PROGRESS = gql`
  query ConversationTagProgress($customerId: String!) {
    conversationTagProgress(customerId: $customerId)
  }
`;

export const CONVERSATION_PROGRESS_CHART = gql`
  query ConversationProgressChart($customerId: String!) {
    conversationProgressChart(customerId: $customerId)
  }
`;
