const createConfig = `
  mutation mnConfigsCreate($code: String!, $subId: String, $value: JSON) {
    mnConfigsCreate(code: $code, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

const updateConfig = `
  mutation mnConfigsUpdate($id: String!, $subId: String, $value: JSON) {
    mnConfigsUpdate(_id: $id, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

const removeConfig = `
  mutation mnConfigsRemove($id: String!) {
    mnConfigsRemove(_id: $id)
  }
`;

const toCheckProducts = `
  mutation toCheckMsdProducts($brandId: String) {
    toCheckMsdProducts(brandId: $brandId)
  }
`;

const toCheckPrices = `
  mutation toCheckMsdPrices($brandId: String) {
    toCheckMsdPrices(brandId: $brandId)
  }
`;

const toSyncProducts = `
  mutation toSyncMsdProducts($brandId: String, $action: String, $products: [JSON]) {
    toSyncMsdProducts(brandId: $brandId, action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation toCheckMsdProductCategories($brandId: String, $categoryId: String) {
    toCheckMsdProductCategories(brandId: $brandId, categoryId: $categoryId)
  }
`;

const toSyncCategories = `
  mutation toSyncMsdProductCategories($brandId: String, $action: String!, $categoryId: String, $categories: [JSON!]!) {
    toSyncMsdProductCategories(brandId: $brandId, action: $action, categoryId: $categoryId, categories: $categories)
  }
`;

const toCheckCustomers = `
  mutation toCheckMsdCustomers($brandId: String) {
    toCheckMsdCustomers(brandId: $brandId)
  }
`;

const toSyncCustomers = `
  mutation toSyncMsdCustomers($brandId: String, $action: String, $customers: [JSON]) {
    toSyncMsdCustomers(brandId: $brandId, action: $action, customers: $customers)
  }
`;

const toSyncPrices = `
  mutation toSyncMsdPrices($prices: [JSON]) {
    toSyncMsdPrices(prices: $prices)
  }
`;

const toCheckMsdSynced = `
  mutation toCheckMsdSynced($ids: [String]) {
    toCheckMsdSynced(ids: $ids) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`;

const toSendMsdOrders = `
  mutation toSendMsdOrders($orderIds: [String]) {
    toSendMsdOrders(orderIds: $orderIds) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`;

export default {
  createConfig,
  updateConfig,
  removeConfig,
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
