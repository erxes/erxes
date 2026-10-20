import { gql } from '~/gql';

export const syncProductsMutation = gql(`
  mutation erkhetSyncProducts($action: String, $products: [JSON]) {
    toSyncProducts(action: $action, products: $products)
  }
`);
