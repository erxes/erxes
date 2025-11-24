import { gql } from '@apollo/client';

const putResponseRemove = gql`
  mutation putResponseRemove($productIds: [String!]) {
    putResponseRemove(productIds: $productIds)
  }
`;

export const putResponseRemoveMutation = { putResponseRemove };
