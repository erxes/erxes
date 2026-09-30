import { gql } from '@apollo/client';

export const ACCOUNTING_INVENTORY_SPLIT_PRODUCTS = gql`
  query AccountingInventorySplitProducts($ids: [String]) {
    productsMain(ids: $ids) {
      list {
        _id
        uom
      }
    }
  }
`;
