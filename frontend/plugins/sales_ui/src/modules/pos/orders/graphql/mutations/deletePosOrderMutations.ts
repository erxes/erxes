import { gql } from '@apollo/client';

export const DELETE_POS_ORDER_MUTATION = gql`
  mutation deletePosOrder($ids: [String!]!) {
    deletePosOrder(ids: $ids)
  }
`;
