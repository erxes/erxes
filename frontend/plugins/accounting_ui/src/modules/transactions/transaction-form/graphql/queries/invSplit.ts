import { gql } from '~/gql';

export const ACCOUNTING_INVENTORY_SPLIT_PRODUCTS = gql(`
query accountingInventorySplitProducts($ids: [String]) {
  productsMain(ids: $ids) {
    list {
      _id
      uom
    }
  }
}
`);
