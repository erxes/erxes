import { gql } from '@apollo/client';

export const syncProductsMutation = gql`
  mutation toSyncProducts($action: String, $products: [JSON]) {
    toSyncProducts(action: $action, products: $products)
  }
`;
