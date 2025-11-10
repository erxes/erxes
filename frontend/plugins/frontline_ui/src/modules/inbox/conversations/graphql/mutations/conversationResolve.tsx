import { gql } from '@apollo/client';

export const CONVERSATION_RESOLVE = gql`
  mutation ConversationsResolve($ids: [String!]!) {
    conversationsResolve(ids: $ids)
  }
`;
