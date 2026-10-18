import { gql } from '~/gql';

export const PRODUCTS_DATA_CHANGED = gql(`
  subscription salesProductsDataChanged($_id: String!) {
    salesProductsDataChanged(_id: $_id) {
      _id
      processId
      action
      data
    }
  }
`);
