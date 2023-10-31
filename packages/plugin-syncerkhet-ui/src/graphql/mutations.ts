// Settings

const updateConfigs = `
  mutation syncerkhetConfigsUpdate($configsMap: JSON!) {
    syncerkhetConfigsUpdate(configsMap: $configsMap)
  }
`;

const toCheckSynced = `
  mutation toCheckSynced($ids: [String]) {
    toCheckSynced(ids: $ids) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`;

const toSyncDeals = `
  mutation toSyncDeals($dealIds: [String], $configStageId: String, $dateType: String) {
    toSyncDeals(dealIds: $dealIds, configStageId: $configStageId, dateType: $dateType)
  }
`;

const toSyncOrders = `
  mutation toSyncOrders($orderIds: [String]) {
    toSyncOrders(orderIds: $orderIds)
  }
`;

const toCheckProducts = `
  mutation toCheckProducts($brandId: String) {
    toCheckProducts(brandId: $brandId)
  }
`;

const toSyncProducts = `
  mutation toSyncProducts($action: String, $products: [JSON]) {
    toSyncProducts(action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation toCheckCategories($brandId: String) {
    toCheckCategories(brandId: $brandId)
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
