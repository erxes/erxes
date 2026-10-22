import { gql } from '~/gql';

const toCheckProducts = gql(`
  mutation msdynamicCheckProducts($brandId: String) {
    toCheckMsdProducts(brandId: $brandId) {
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
      matched
    }
  }
`);

const toCheckPrices = gql(`
  mutation msdynamicCheckPrices($brandId: String) {
    toCheckMsdPrices(brandId: $brandId) {
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
      match {
        items
        count
      }
      error {
        items
        count
      }
    }
  }
`);

const toSyncProducts = gql(`
  mutation msdynamicSyncProducts($brandId: String, $action: String, $products: [JSON]) {
    toSyncMsdProducts(brandId: $brandId, action: $action, products: $products)
  }
`);

const toCheckCategories = gql(`
  mutation msdynamicCheckProductCategories($brandId: String, $categoryId: String) {
    toCheckMsdProductCategories(brandId: $brandId, categoryId: $categoryId) {
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

const toSyncCategories = gql(`
  mutation msdynamicSyncProductCategories($brandId: String, $action: String!, $categoryId: String, $categories: [JSON!]!) {
    toSyncMsdProductCategories(brandId: $brandId, action: $action, categoryId: $categoryId, categories: $categories)
  }
`);

const toCheckCustomers = gql(`
  mutation msdynamicCheckCustomers($brandId: String) {
    toCheckMsdCustomers(brandId: $brandId) {
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
      error {
        items
        count
      }
    }
  }
`);

const toSyncCustomers = gql(`
  mutation msdynamicSyncCustomers($brandId: String, $action: String, $customers: [JSON]) {
    toSyncMsdCustomers(brandId: $brandId, action: $action, customers: $customers)
  }
`);

const toSyncPrices = gql(`
  mutation msdynamicSyncPrices($prices: [JSON], $brandId: String) {
    toSyncMsdPrices(prices: $prices, brandId: $brandId)
  }
`);

const toCheckMsdSynced = gql(`
  mutation msdynamicCheckSynced($ids: [String]) {
    toCheckMsdSynced(ids: $ids) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`);

const toSendMsdOrders = gql(`
  mutation msdynamicSendOrders($orderIds: [String]) {
    toSendMsdOrders(orderIds: $orderIds) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`);

export default {
  toCheckProducts,
  toCheckPrices,
  toSyncProducts,
  toCheckCategories,
  toSyncCategories,
  toCheckCustomers,
  toSyncCustomers,
  toSyncPrices,
  toCheckMsdSynced,
  toSendMsdOrders,
};
