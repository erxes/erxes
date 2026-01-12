import { gql } from '@apollo/client';

export const DELETE_POS_ITEMS_MUTATION = gql`
  mutation posItemsRemove($ids: [String!]!) {
    posItemsRemove(ids: $ids)
  }
`;
