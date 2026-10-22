import { gql } from '~/gql';

export const checkProductsMutation = gql(`
  mutation erkhetCheckProducts($productCodes: [String]) {
    toCheckProducts(productCodes: $productCodes) {
      create {
        items
        count
      }
      update {
        items
        count
      }
      delete {
        items
        count
      }
      matched {
        count
      }
    }
  }
`);
