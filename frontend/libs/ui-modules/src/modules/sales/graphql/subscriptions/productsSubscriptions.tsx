import { gql } from '@apollo/client';

export const PRODUCTS_DATA_CHANGED = gql`
  subscription salesProductsDataChanged($_id: String!) {
    salesProductsDataChanged(_id: $_id) {
      _id
      processId
      action
      data
    }
  }
`;
