import { gql } from '@apollo/client';

export const getImapConversationDetail = gql`
  query imapConversationDetail($conversationId: String!) {
    imapConversationDetail(conversationId: $conversationId) {
      _id
      mailData
      createdAt
    }
  }
`;
