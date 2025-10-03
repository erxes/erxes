import { gql } from '@apollo/client';

export const IMAP_CONVERSATION_DETAIL_QUERY = gql`
  query imapConversationDetail($conversationId: String!) {
    imapConversationDetail(conversationId: $conversationId) {
      _id
      mailData
      createdAt
      __typename
    }
  }
`;
