// Settings

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckSynced = `
  mutation toCheckSynced($ids: [String]) {
    toCheckSynced(ids: $ids) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
    }
  }
`;

const toSyncDeals = `
  mutation toSyncDeals($dealIds: [String]) {
    toSyncDeals(dealIds: $dealIds)
  }
`;

const toSyncOrders = `
  mutation toSyncOrders($orderIds: [String]) {
    toSyncOrders(orderIds: $orderIds)
  }
`;

const toCheckProducts = `
  mutation toCheckProducts($productCodes: [String]) {
    toCheckProducts(productCodes: $productCodes)
  }
`;

const toSyncProducts = `
  mutation toSyncProducts($action: String, $products: [JSON]) {
    toSyncProducts(action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation toCheckCategories($categoryCodes: [String]) {
    toCheckCategories(categoryCodes: $categoryCodes)
  }
`;

const toSyncCategories = `
  mutation toSyncCategories($action: String, $categories: [JSON]) {
    toSyncCategories(action: $action, categories: $categories)
  }
`;

export default {
  updateConfigs,
  toCheckSynced,
  toSyncDeals,
  toSyncOrders,
  toCheckCategories,
  toCheckProducts,
  toSyncCategories,
  toSyncProducts
};
