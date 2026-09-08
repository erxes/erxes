import { gql } from '@apollo/client';

export const MAIL_CONVERSATION_DETAIL_QUERY = gql`
  query mailConversationDetail($conversationId: String!, $limit: Int) {
    mailConversationDetail(conversationId: $conversationId, limit: $limit) {
      messages {
        _id
        mailData
        createdAt
        __typename
      }
      hasMore
      __typename
    }
  }
`;

export const MAIL_MESSAGE_INSERTED_SUBSCRIPTION = gql`
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      _id
    }
  }
`;
