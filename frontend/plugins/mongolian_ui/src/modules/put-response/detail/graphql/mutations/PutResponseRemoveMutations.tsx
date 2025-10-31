import { gql } from '@apollo/client';

const putResponseRemove = gql`
  mutation productsRemove($productIds: [String!]) {
    productsRemove(productIds: $productIds)
  }
`;

export const putResponseRemoveMutation = { putResponseRemove };
