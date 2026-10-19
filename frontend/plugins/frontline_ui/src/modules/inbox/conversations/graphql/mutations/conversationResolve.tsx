import { gql } from '~/gql';

export const CONVERSATION_RESOLVE = gql(`
  mutation ConversationsResolve($ids: [String!]!) {
    conversationsResolve(ids: $ids)
  }
`);
