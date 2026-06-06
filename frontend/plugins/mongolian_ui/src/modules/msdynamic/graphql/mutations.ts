const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckProducts = `
  mutation toCheckMsdProducts($brandId: String) {
    toCheckMsdProducts(brandId: $brandId)
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
  mutation toSyncMsdProductCategories($brandId: String, $action: String, $categoryId: String, $categories: [JSON]) {
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
  mutation toSyncMsdPrices($brandId: String) {
    toSyncMsdPrices(brandId: $brandId)
  }
`;

const toCheckMsdSynced = `
  mutation toCheckMsdSynced($ids: [String], $brandId: String) {
    toCheckMsdSynced(ids: $ids, brandId: $brandId) {
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
  updateConfigs,
  toCheckProducts,
  toSyncProducts,
  toCheckCategories,
  toSyncCategories,
  toCheckCustomers,
  toSyncCustomers,
  toSyncPrices,
  toCheckMsdSynced,
  toSendMsdOrders,
};
